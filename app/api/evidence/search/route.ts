import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EvidenceQueryInput, NormalizedEvidence } from "@/lib/evidence/types";
import { searchGoogleCse, googleSearch } from "@/lib/evidence/googleCse";
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
    });

    // Fetch evidence from both sources
    // Google: Execute queries sequentially with delays
    const googleResults: Awaited<ReturnType<typeof searchGoogleCse>> = [];
    for (const query of searchQueries) {
      const result = await googleSearch(query);
      googleResults.push(result);
      // Small delay between requests
      if (searchQueries.indexOf(query) < searchQueries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }

    // Hacker News: Fetch
    let hnResults: Awaited<ReturnType<typeof searchHackerNews>> = [];
    try {
      hnResults = await searchHackerNews(keywords);
      console.log(`[Evidence] Hacker News: ${hnResults.length} hits found`);
    } catch (err) {
      console.error("[Evidence] Hacker News fetch failed:", err);
      // Continue with empty HN results
    }

    // Extract competitors from Google results
    const competitors = extractCompetitorsFromGoogle(googleResults);
    const competitorSummary = generateCompetitorSummary(competitors);

    // Log evidence for debugging
    const googleItemCount = googleResults.reduce((sum, q) => sum + q.items.length, 0);
    console.log(`[Evidence] Google results: ${googleItemCount} items, HN results: ${hnResults.length} hits, Competitors: ${competitors.length}`);

    // Normalize evidence (includes competitors now)
    const normalized = normalizeEvidence(googleResults, hnResults, competitors);

    // Add competitors and summary to normalized evidence
    const evidenceWithCompetitors = {
      ...normalized,
      competitors,
      competitorSummary,
    };

    // Compute signals (now includes competitor-aware logic)
    const signals = computeSignals(evidenceWithCompetitors);
    
    console.log(`[Evidence] Signals computed:`, {
      competitor_density: signals.competitor_density,
      evidenceCoverage: signals.evidenceCoverage,
      marketEstablished: signals.marketEstablished,
      competitorCount: competitors.length,
    });

    // Combine into full evidence object
    const evidence: NormalizedEvidence = {
      ...evidenceWithCompetitors,
      signals,
    };

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

