import { NextRequest, NextResponse } from "next/server";
import { searchHackerNews } from "@/lib/evidence/hackerNews";
import { searchGoogleCse, getLastGoogleCseDiagnostics } from "@/lib/evidence/googleCse";
import { logRuntimeEnvDiagnosticsOnce } from "@/lib/config/env";

/**
 * Test endpoint to verify evidence APIs are working
 * GET /api/test-evidence
 */
export async function GET(request: NextRequest) {
  // One-time, safe runtime diagnostics for Firebase + Google project wiring
  logRuntimeEnvDiagnosticsOnce("/api/test-evidence");

  const results: any = {
    timestamp: new Date().toISOString(),
    hackerNews: {
      configured: true, // HN doesn't need API keys
      status: "testing",
      hits: [],
      error: null,
    },
    googleCse: {
      configured: !!process.env.SERPER_API_KEY,
      status: "testing",
      results: [],
      error: null,
    },
  };

  // Test Hacker News (NO API KEY REQUIRED)
  try {
    console.log("[Test] Testing Hacker News API...");
    const hnHits = await searchHackerNews(["startup", "software", "tool"]);
    results.hackerNews.status = "success";
    results.hackerNews.hits = hnHits.slice(0, 3).map(hit => ({
      title: hit.title,
      url: hit.url,
      points: hit.points,
      comments: hit.num_comments,
    }));
    results.hackerNews.message = `Found ${hnHits.length} hits (showing first 3)`;
  } catch (err: any) {
    results.hackerNews.status = "error";
    results.hackerNews.error = err?.message || "Unknown error";
    console.error("[Test] Hacker News failed:", err);
  }

  // Test Google CSE (REQUIRES API KEYS)
  if (results.googleCse.configured) {
    try {
      console.log("[Test] Testing Serper.dev search API...");
      const googleResult = await searchGoogleCse(["startup software tool"]);
      const flatItems = googleResult.results.flatMap(r => r.items);
      const totalItems = flatItems.length;

      // Attach diagnostics from the last CSE call (non-secret)
      results.googleCse.debug = getLastGoogleCseDiagnostics();

      if (googleResult.errors.length > 0) {
        const firstError = googleResult.errors[0].error;
        const statusCode = firstError.statusCode;
        results.googleCse.status = statusCode === 403 ? "blocked" : "error";
        results.googleCse.error = firstError.message;
        results.googleCse.warnings = googleResult.errors.map(e => e.error.message);
        results.googleCse.message = `Google CSE returned 0 items due to error (statusCode=${statusCode ?? "n/a"})`;
        results.googleCse.results = [];
      } else {
        results.googleCse.status = "success";
        results.googleCse.results = flatItems.slice(0, 3).map(item => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet.substring(0, 100),
        }));
        results.googleCse.message = `Found ${totalItems} items (showing first 3)`;
      }
    } catch (err: any) {
      results.googleCse.status = "error";
      results.googleCse.error = err?.message || "Unknown error";
      console.error("[Test] Google CSE failed:", err);
    }
  } else {
    results.googleCse.status = "not_configured";
      results.googleCse.message = "SERPER_API_KEY not set in environment";
      results.googleCse.instructions =
        "To enable Serper.dev search:\n1. Go to https://serper.dev\n2. Sign up and create an API key\n3. Add SERPER_API_KEY to .env.local\n4. Restart the Next.js dev server.";
  }

  return NextResponse.json(results, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

