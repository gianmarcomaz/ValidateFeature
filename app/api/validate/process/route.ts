import { NextRequest, NextResponse } from "next/server";
import { searchGoogleCse } from "@/lib/evidence/googleCse";
import { GoogleCseQueryResult } from "@/lib/evidence/types";
import { searchHackerNews } from "@/lib/evidence/hackerNews";
import { extractCompetitorsFromGoogle } from "@/lib/evidence/competitors";
import { computeSignals } from "@/lib/evidence/signals";
import { buildSearchQueries } from "@/lib/evidence/queryBuilder";
import { normalizeEvidence, generateCompetitorSummary } from "@/lib/evidence/normalize";
import { NormalizedEvidence } from "@/lib/evidence/types";
import { updateSubmissionAdmin } from "@/lib/firebase/admin-db";
import { normalizeFeature } from "@/lib/llm/normalize";
import { generateVerdict } from "@/lib/llm/verdict";

// Timeout utility using Promise.race
async function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    fallback: T
): Promise<{ result: T; timedOut: boolean }> {
    let timeoutId: NodeJS.Timeout;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });

    try {
        const result = await Promise.race([promise, timeoutPromise]);
        clearTimeout(timeoutId!);
        return { result, timedOut: false };
    } catch (err: any) {
        clearTimeout(timeoutId!);
        if (err.message?.includes('Timeout')) {
            console.log(`[Worker] Timeout after ${ms}ms, using fallback`);
            return { result: fallback, timedOut: true };
        }
        throw err;
    }
}

/**
 * Background worker endpoint for progressive validation processing
 * Called fire-and-forget from the submit handler
 */
export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const body = await request.json();
        const { submissionId, feature, icp, goalMetric, mode, startup } = body;

        if (!submissionId) {
            return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
        }

        console.log(`[Worker] Starting processing for submission: ${submissionId}`);
        const timings: Record<string, number> = {};

        // ============ STAGE 1: NORMALIZE ============
        console.log(`[Worker] Stage 1: Normalizing...`);
        await updateSubmissionAdmin(submissionId, { stage: "normalizing" });

        const normalizeStart = Date.now();
        let normalized: any = null;

        try {
            // Direct call, no fetch
            normalized = await normalizeFeature({ feature, icp, goalMetric, mode });
        } catch (err: any) {
            console.error("[Worker] Normalize failed:", err.message);
        }

        timings.normalizeMs = Date.now() - normalizeStart;
        console.log(`[Worker] Normalize completed in ${timings.normalizeMs}ms`);

        // Update with normalized data
        if (normalized) {
            await updateSubmissionAdmin(submissionId, { normalized });
        }

        // ============ STAGE 2: EVIDENCE (PARALLEL) ============
        console.log(`[Worker] Stage 2: Fetching evidence in parallel...`);
        await updateSubmissionAdmin(submissionId, { stage: "evidence" });

        const evidenceStart = Date.now();

        // Build search queries
        const keywords = normalized?.keywordQuerySet || [feature?.title || ""];
        const searchQueries = buildSearchQueries({
            query: feature?.title || "",
            keywords,
            startup,
            feature,
        });

        // Parallel fetch with timeouts
        const [googleData, hnData] = await Promise.all([
            // Google CSE with 6s timeout (Serper batches can take 3-5s)
            withTimeout(
                searchGoogleCse(searchQueries),
                6000,
                { results: [] as GoogleCseQueryResult[], configured: false, errors: [] }
            ),
            // HackerNews with 4s timeout
            withTimeout(
                searchHackerNews(keywords),
                4000,
                []
            )
        ]);

        const googleResults = googleData.result.results || [];
        const hnResults = hnData.result || [];

        timings.evidenceMs = Date.now() - evidenceStart;
        console.log(`[Worker] Evidence fetched in ${timings.evidenceMs}ms (Google: ${googleResults.length} queries, HN: ${Array.isArray(hnResults) ? hnResults.length : 0} hits)`);

        // Extract competitors
        let competitors: any[] = [];
        let competitorSummary: { totalCompetitorsFound: number; topCompetitors: string[]; saturationSignal: "low" | "medium" | "high" } = { totalCompetitorsFound: 0, topCompetitors: [], saturationSignal: "low" };

        try {
            competitors = extractCompetitorsFromGoogle(googleResults);
            competitorSummary = generateCompetitorSummary(competitors);
        } catch (err) {
            console.error("[Worker] Competitor extraction failed:", err);
        }

        // Build normalized evidence (3 args: googleResults, hnResults, competitors)
        const evidenceBase = normalizeEvidence(googleResults, Array.isArray(hnResults) ? hnResults : [], competitors);

        // Build complete evidence object
        const evidence: NormalizedEvidence = {
            ...evidenceBase,
            competitors,
            competitorSummary,
            signals: undefined as any, // Will be set below
        };

        // Compute signals
        const signals = computeSignals(evidence);
        evidence.signals = signals;

        // Update with evidence
        await updateSubmissionAdmin(submissionId, { evidence });
        console.log(`[Worker] Evidence saved to submission`);

        // ============ STAGE 3: VERDICT (LLM) ============
        console.log(`[Worker] Stage 3: Generating verdict...`);
        await updateSubmissionAdmin(submissionId, { stage: "verdict" });

        const verdictStart = Date.now();
        let verdict: any = null;

        try {
            // Direct call, no fetch
            verdict = await generateVerdict({
                feature,
                icp,
                goalMetric,
                mode,
                normalized,
                evidence,
                startup,
            });
        } catch (err: any) {
            console.error("[Worker] Verdict failed:", err.message);
        }

        timings.verdictMs = Date.now() - verdictStart;
        timings.totalMs = Date.now() - startTime;

        console.log(`[Worker] Verdict completed in ${timings.verdictMs}ms`);
        console.log(`[Worker] Total processing time: ${timings.totalMs}ms`);

        // ============ FINAL UPDATE ============
        const finalUpdate: Record<string, any> = {
            stage: verdict ? "complete" : "partial",
            status: verdict ? "verdict_ready" : "partial",
            timings,
        };

        if (verdict) {
            finalUpdate.verdict = verdict;
        } else {
            finalUpdate.processingError = "Verdict generation timed out or failed";
        }

        await updateSubmissionAdmin(submissionId, finalUpdate);

        console.log(`[Worker] Processing complete for ${submissionId}`);

        return NextResponse.json({
            success: true,
            submissionId,
            timings,
            stage: finalUpdate.stage,
        });

    } catch (err: any) {
        console.error("[Worker] Fatal error:", err);

        // Try to log fatal error to DB if possible (and we have submissionId in body if we parsed it)
        // But since we might be in catch block early, we can't guarantee submissionId.

        return NextResponse.json(
            { error: "Worker processing failed", message: err.message },
            { status: 500 }
        );
    }
}
