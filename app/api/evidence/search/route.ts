import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EvidenceQueryInput, NormalizedEvidence } from "@/lib/evidence/types";
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

    // Fetch evidence from both sources
    // Google: Execute searches using searchGoogleCse helper
    const googleSearchResult = await searchGoogleCse(searchQueries);
    const googleResults = googleSearchResult.results;
    const googleConfigured = googleSearchResult.configured;

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

    // Build warnings array
    const warnings: NormalizedEvidence["warnings"] = [];
    
    if (!googleConfigured) {
      warnings.push({
        type: "missing_config",
        message: "Google CSE not configured",
        details: "Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX in .env.local to enable Google search results",
      });
    }
    
    if (googleSearchResult.errors.length > 0) {
      const errorTypes = new Set(googleSearchResult.errors.map(e => e.error?.type));
      if (errorTypes.has("rate_limit")) {
        warnings.push({
          type: "api_error",
          message: "Google CSE rate limit reached",
          details: "Some queries were skipped due to rate limiting",
        });
      } else if (errorTypes.has("auth_error")) {
        warnings.push({
          type: "api_error",
          message: "Google CSE authentication failed",
          details: "Check your API key and quota",
        });
      }
    }
    
    const googleItemCount = googleResults.reduce((sum, q) => sum + q.items.length, 0);
    if (googleConfigured && googleItemCount === 0) {
      warnings.push({
        type: "no_results",
        message: "No Google search results found",
        details: "Try adjusting search queries or check if queries are too specific",
      });
    }
    
    // Log evidence for debugging (structured, no secrets)
    console.log(`[Evidence] googleConfigured=${googleConfigured}, googleItems=${googleItemCount}, hnHits=${hnResults.length}, competitors=${competitors.length}, warnings=${warnings.length}`);

    // Normalize evidence (includes competitors now)
    const normalized = normalizeEvidence(googleResults, hnResults, competitors);

    // Add competitors and summary to normalized evidence with Google config status
    const evidenceWithCompetitors = {
      ...normalized,
      google: {
        ...normalized.google,
        configured: googleConfigured,
      },
      competitors,
      competitorSummary,
    };

    // Compute signals (now includes competitor-aware logic + perMetricEvidence)
    const signals = computeSignals(evidenceWithCompetitors);
    
    // Structured logging (counts only, no secrets)
    console.log(`[Evidence] Signals: competitorDensity=${Math.round(signals.competitor_density)}, evidenceCoverage=${Math.round(signals.evidenceCoverage)}, marketEstablished=${signals.marketEstablished}`);

    // Combine into full evidence object
    const evidence: NormalizedEvidence = {
      ...evidenceWithCompetitors,
      signals,
      warnings: warnings.length > 0 ? warnings : undefined,
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

