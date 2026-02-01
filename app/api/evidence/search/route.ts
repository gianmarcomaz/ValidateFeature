import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EvidenceQueryInput, NormalizedEvidence, GoogleCseQueryResult } from "@/lib/evidence/types";
import { searchGoogleCse } from "@/lib/evidence/googleCse";
import { searchHackerNews } from "@/lib/evidence/hackerNews";
import { normalizeEvidence, generateCompetitorSummary } from "@/lib/evidence/normalize";
import { computeSignals } from "@/lib/evidence/signals";
import { deriveKeywords } from "@/lib/evidence/keywords";
import { buildSearchQueries } from "@/lib/evidence/queryBuilder";
import { extractCompetitorsFromGoogle } from "@/lib/evidence/competitors";

// Request schema
const EvidenceSearchRequestSchema = z.object({
  query: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  startup: z.object({
    name: z.string().optional(),
    targetAudience: z.string().optional(),
    problemSolved: z.string().optional(),
    websiteUrl: z.string().optional(),
  }).optional(),
  feature: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    problemSolved: z.string().optional(),
    targetAudience: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    let validatedBody: EvidenceQueryInput;
    try {
      validatedBody = EvidenceSearchRequestSchema.parse(body);
    } catch (error: any) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "Invalid request body",
            details: error.errors || error.message,
          },
        },
        { status: 400 }
      );
    }

    // Derive keywords if not provided
    const keywords = validatedBody.keywords || deriveKeywords(validatedBody.query);

    if (keywords.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NO_KEYWORDS",
            message: "Could not derive keywords from query",
          },
        },
        { status: 400 }
      );
    }

    // Build strategic search queries (6-10 queries max)
    const searchQueries = buildSearchQueries({
      query: validatedBody.query,
      keywords,
      startup: validatedBody.startup,
      feature: validatedBody.feature,
    });

    if (searchQueries.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "NO_QUERIES",
            message: "Could not generate search queries from input",
          },
        },
        { status: 400 }
      );
    }

    // Fetch evidence from both sources IN PARALLEL (with error handling)
    console.log(`[Evidence] Fetching Google and HN in parallel...`);

    // Prepare the parallel fetch operations
    const googleFetchPromise = searchGoogleCse(searchQueries)
      .then(result => ({
        success: true as const,
        results: result.results || [],
        configured: result.configured || false,
        errors: result.errors || []
      }))
      .catch((err: any) => {
        console.error("[Evidence] Google CSE fetch failed:", err?.message || err);
        return {
          success: false as const,
          results: [] as GoogleCseQueryResult[],
          configured: false,
          errors: [{ error: { type: "api_error", message: err?.message || "Google CSE fetch failed" } }]
        };
      });

    const hnFetchPromise = searchHackerNews(keywords)
      .then(hits => {
        console.log(`[Evidence] Hacker News: ${hits.length} hits found`);
        if (hits.length > 0) {
          console.log(`[Evidence] Sample HN hit: ${hits[0].title} (${hits[0].url || "no URL"})`);
        }
        return hits;
      })
      .catch((err: any) => {
        console.error("[Evidence] Hacker News fetch failed:", err?.message || err);
        return [] as Awaited<ReturnType<typeof searchHackerNews>>;
      });

    // Execute both fetches in parallel
    const [googleData, hnResults] = await Promise.all([googleFetchPromise, hnFetchPromise]);

    const googleResults = googleData.results;
    const googleConfigured = googleData.configured;
    const googleErrors = googleData.errors;

    // Extract competitors from Google results (safe even if empty)
    let competitors: any[] = [];
    let competitorSummary: any = { totalCompetitorsFound: 0, topCompetitors: [], saturationSignal: "low" as const };

    try {
      competitors = extractCompetitorsFromGoogle(googleResults);
      competitorSummary = generateCompetitorSummary(competitors);
    } catch (err) {
      console.error("[Evidence] Competitor extraction failed:", err);
      // Continue with empty competitors
    }

    // Build warnings array
    const warnings: NormalizedEvidence["warnings"] = [];

    if (!googleConfigured) {
      warnings.push({
        type: "missing_config",
        message: "Serper.dev search not configured",
        details: "Set SERPER_API_KEY in .env.local to enable external search results",
      });
    }

    if (googleErrors.length > 0) {
      const errorTypes = new Set(googleErrors.map((e: any) => e?.error?.type || e?.type));
      if (errorTypes.has("rate_limit")) {
        warnings.push({
          type: "api_error",
          message: "Serper.dev rate limit reached",
          details: "Some queries were skipped due to Serper.dev rate limiting",
        });
      } else if (errorTypes.has("auth_error")) {
        warnings.push({
          type: "api_error",
          message: "Serper.dev authentication failed",
          details: "Check SERPER_API_KEY and your Serper.dev account credits/plan.",
        });
      } else if (errorTypes.has("api_error") || errorTypes.has("missing_config")) {
        // missing_config is already handled above, but check for api_error
        if (!errorTypes.has("missing_config")) {
          warnings.push({
            type: "api_error",
            message: "Serper.dev API error occurred",
            details: "Some search queries may have failed on Serper.dev",
          });
        }
      }
    }

    const googleItemCount = googleResults.reduce((sum, q) => sum + q.items.length, 0);
    if (googleConfigured && googleItemCount === 0) {
      warnings.push({
        type: "no_results",
        message: "No external search results found",
        details: "Try adjusting search queries or check if queries are too specific",
      });
    }

    // Log evidence for debugging (structured, no secrets)
    console.log(`[Evidence] googleConfigured=${googleConfigured}, googleItems=${googleItemCount}, hnHits=${hnResults.length}, competitors=${competitors.length}, warnings=${warnings.length}`);

    // Additional debug: Check if APIs are actually being called
    if (!googleConfigured) {
      console.log(`[Evidence] Serper.dev search not configured - check SERPER_API_KEY env var`);
    } else if (googleItemCount === 0) {
      console.log(`[Evidence] Serper.dev search configured but returned 0 items - check API quota or query relevance`);
    }

    if (hnResults.length === 0) {
      console.log(`[Evidence] HN returned 0 hits for keywords: ${keywords.slice(0, 3).join(", ")}`);
    }

    // Normalize evidence (includes competitors now) - safe even if empty
    let normalized: any;
    let signals: any;

    try {
      normalized = normalizeEvidence(googleResults, hnResults, competitors);

      // Add competitors and summary to normalized evidence with Google config status
      const evidenceForSignals = {
        ...normalized,
        google: {
          ...normalized.google,
          configured: googleConfigured,
        },
        competitors,
        competitorSummary,
      };

      // Compute signals (now includes competitor-aware logic + perMetricEvidence)
      signals = computeSignals(evidenceForSignals);
    } catch (err: any) {
      console.error("[Evidence] Normalization or signal computation failed:", err);
      // Return minimal valid evidence structure
      normalized = {
        google: { configured: googleConfigured, queries: googleResults },
        hackernews: { hits: hnResults },
        citations: [],
        generatedAt: new Date().toISOString(),
      };
      signals = {
        competitor_density: 0,
        recency_score: 50,
        pain_signal: 0,
        overall_evidence_score: 0,
        evidenceCoverage: 0,
        marketEstablished: false,
        notes: ["Evidence normalization failed - using minimal structure"],
      };
      warnings.push({
        type: "api_error",
        message: "Evidence processing error",
        details: "Some evidence data may be incomplete",
      });
    }

    // Structured logging (counts only, no secrets)
    const evidenceCoverage = signals?.evidenceCoverage || 0;
    console.log(`[Evidence] Signals: competitorDensity=${Math.round(signals?.competitor_density || 0)}, evidenceCoverage=${Math.round(evidenceCoverage)}, marketEstablished=${signals?.marketEstablished || false}`);

    // Build final evidence object (always defined, regardless of success/failure path)
    // Ensure all required fields are present with safe defaults
    const evidence: NormalizedEvidence = {
      google: {
        configured: googleConfigured,
        queries: normalized?.google?.queries || googleResults || [],
      },
      hackernews: {
        hits: normalized?.hackernews?.hits || hnResults || [],
      },
      competitors: competitors || [],
      competitorSummary: competitorSummary || {
        totalCompetitorsFound: 0,
        topCompetitors: [],
        saturationSignal: "low" as const
      },
      citations: normalized?.citations || [],
      signals: signals || {
        competitor_density: 0,
        recency_score: 50,
        pain_signal: 0,
        overall_evidence_score: 0,
        evidenceCoverage: 0,
        marketEstablished: false,
        notes: ["Evidence processing incomplete"],
      },
      warnings: warnings.length > 0 ? warnings : undefined,
      generatedAt: normalized?.generatedAt || new Date().toISOString(),
    };

    // Final safety check - ensure evidence object is valid
    if (!evidence.google || !evidence.hackernews || !evidence.signals) {
      console.error("[Evidence] Invalid evidence structure built - using fallback");
      return NextResponse.json(
        {
          error: {
            code: "EVIDENCE_STRUCTURE_ERROR",
            message: "Failed to build valid evidence structure",
          },
          evidence: {
            google: { configured: false, queries: [] },
            hackernews: { hits: [] },
            competitors: [],
            competitorSummary: { totalCompetitorsFound: 0, topCompetitors: [], saturationSignal: "low" },
            citations: [],
            signals: {
              competitor_density: 0,
              recency_score: 50,
              pain_signal: 0,
              overall_evidence_score: 0,
              evidenceCoverage: 0,
              marketEstablished: false,
              notes: ["Evidence structure error"],
            },
            warnings: [{
              type: "api_error",
              message: "Evidence structure error",
              details: "Failed to build valid evidence object",
            }],
            generatedAt: new Date().toISOString(),
          },
        },
        { status: 200 } // Return 200 with error in payload, not 500
      );
    }

    return NextResponse.json({ evidence });
  } catch (error: any) {
    console.error("Error in evidence/search route:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}

