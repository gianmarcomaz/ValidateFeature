import { NextRequest, NextResponse } from "next/server";
import { searchHackerNews } from "@/lib/evidence/hackerNews";
import { searchGoogleCse } from "@/lib/evidence/googleCse";

/**
 * Test endpoint to verify evidence APIs are working
 * GET /api/test-evidence
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    hackerNews: {
      configured: true, // HN doesn't need API keys
      status: "testing",
      hits: [],
      error: null,
    },
    googleCse: {
      configured: !!(process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_CX),
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
      console.log("[Test] Testing Google CSE API...");
      const googleResult = await searchGoogleCse(["startup software tool"]);
      results.googleCse.status = "success";
      results.googleCse.results = googleResult.results.flatMap(r => r.items).slice(0, 3).map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet.substring(0, 100),
      }));
      results.googleCse.message = `Found ${googleResult.results.reduce((sum, r) => sum + r.items.length, 0)} items (showing first 3)`;
      if (googleResult.errors.length > 0) {
        results.googleCse.warnings = googleResult.errors.map(e => e.error.message);
      }
    } catch (err: any) {
      results.googleCse.status = "error";
      results.googleCse.error = err?.message || "Unknown error";
      console.error("[Test] Google CSE failed:", err);
    }
  } else {
    results.googleCse.status = "not_configured";
    results.googleCse.message = "GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX not set in environment";
    results.googleCse.instructions = "To enable Google CSE:\n1. Go to https://console.cloud.google.com/\n2. Create a project (or use existing)\n3. Enable 'Custom Search API'\n4. Create credentials (API Key)\n5. Go to https://programmablesearchengine.google.com/\n6. Create a Custom Search Engine\n7. Get the Search Engine ID (CX)\n8. Add both to .env.local";
  }

  return NextResponse.json(results, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

