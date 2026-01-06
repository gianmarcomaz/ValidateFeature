// Normalize evidence from multiple sources
import { NormalizedEvidence, GoogleCseQueryResult, HackerNewsHit, Competitor, CompetitorSummary } from "./types";
import { extractCompetitorsFromGoogle } from "./competitors";

export function normalizeEvidence(
  googleResults: GoogleCseQueryResult[],
  hnResults: HackerNewsHit[],
  competitors: Competitor[] = []
): Omit<NormalizedEvidence, "signals" | "competitors" | "competitorSummary"> {
  // Flatten all Google items
  const allGoogleItems = googleResults.flatMap(result => result.items);

  // Generate citations (top 5 from Google, top 3 from HN, top 3 from competitors)
  const citations: NormalizedEvidence["citations"] = [];

  // Top 5 Google results
  allGoogleItems.slice(0, 5).forEach(item => {
    if (item.link) {
      citations.push({
        source: "google",
        title: item.title,
        url: item.link,
      });
    }
  });

  // Top 3 HN results
  hnResults
    .slice(0, 3)
    .filter(hit => hit.url)
    .forEach(hit => {
      citations.push({
        source: "hackernews",
        title: hit.title,
        url: hit.url!,
      });
    });

  // Add competitor links
  competitors.slice(0, 3).forEach(comp => {
    citations.push({
      source: "google",
      title: comp.name,
      url: comp.url,
    });
  });

  return {
    google: {
      configured: false, // Will be set by caller
      queries: googleResults,
    },
    hackernews: {
      hits: hnResults,
    },
    citations,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate competitor summary
 */
export function generateCompetitorSummary(competitors: Competitor[]): CompetitorSummary {
  const topCompetitors = competitors
    .slice(0, 5)
    .map(c => c.name);

  const enterpriseCount = competitors.filter(c => 
    c.domain.includes("workday") || 
    c.domain.includes("icims") || 
    c.domain.includes("greenhouse") ||
    c.domain.includes("lever") ||
    c.domain.includes("smartrecruiters")
  ).length;

  let saturationSignal: "low" | "medium" | "high";
  if (competitors.length >= 5 || enterpriseCount > 0) {
    saturationSignal = "high";
  } else if (competitors.length >= 3) {
    saturationSignal = "medium";
  } else {
    saturationSignal = "low";
  }

  return {
    totalCompetitorsFound: competitors.length,
    topCompetitors,
    saturationSignal,
  };
}

