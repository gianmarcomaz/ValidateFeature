// Compute evidence signals from normalized data
import { NormalizedEvidence, Competitor } from "./types";

const PRODUCT_INDICATORS = [
  "app", "software", "saas", "pricing", "docs", "producthunt", "github",
  "tool", "platform", "service", "solution", "product", "website", "com"
];

const PAIN_INDICATORS = [
  "how to", "struggling", "problem", "issue", "pain", "manual", "annoying",
  "need", "difficult", "challenge", "frustrating", "boring", "tedious",
  "error", "bug", "broken", "missing", "lack", "wish", "want"
];

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Check if domain looks like a product/service
 */
function isProductDomain(domain: string): boolean {
  const lowerDomain = domain.toLowerCase();
  return PRODUCT_INDICATORS.some(indicator => lowerDomain.includes(indicator));
}

/**
 * Check if competitor is enterprise ATS
 */
function isEnterpriseATS(domain: string): boolean {
  const enterpriseATS = ["workday", "icims", "greenhouse", "lever", "smartrecruiters", 
    "jobvite", "taleo", "cornerstone", "peoplefluent", "successfactors"];
  return enterpriseATS.some(ats => domain.toLowerCase().includes(ats));
}

/**
 * Compute competitor density (0-100) based on actual competitors found
 */
function computeCompetitorDensity(competitors: Competitor[]): number {
  const count = competitors.length;
  
  // Boost score if enterprise ATS found
  const enterpriseCount = competitors.filter(c => isEnterpriseATS(c.domain)).length;
  const enterpriseBoost = enterpriseCount * 20;
  
  // Base score: 0-10 competitors = 0-50, 10-20 = 50-80, 20+ = 80-100
  let baseScore = 0;
  if (count === 0) baseScore = 0;
  else if (count <= 10) baseScore = Math.min(50, count * 5);
  else if (count <= 20) baseScore = 50 + (count - 10) * 3;
  else baseScore = Math.min(100, 80 + (count - 20) * 1);
  
  return Math.min(100, baseScore + enterpriseBoost);
}

/**
 * Determine if market is established
 */
function computeMarketEstablished(competitors: Competitor[]): boolean {
  // Market is established if:
  // 1. Found 3+ competitors, OR
  // 2. Found any enterprise ATS
  if (competitors.length >= 3) return true;
  
  return competitors.some(c => isEnterpriseATS(c.domain));
}

/**
 * Compute recency score (0-100)
 * Note: HN may not represent recruiter/HR discussions - don't penalize low HN activity for B2B HR tools
 */
function computeRecencyScore(hnResults: NormalizedEvidence["hackernews"], competitors: Competitor[]): number {
  if (hnResults.hits.length === 0) {
    // If we found enterprise competitors, HN absence is expected - return neutral
    const hasEnterprise = competitors.some(c => isEnterpriseATS(c.domain));
    return hasEnterprise ? 60 : 50; // Slightly positive if enterprise found, neutral otherwise
  }

  const now = Date.now();
  const recentThreshold = 90 * 24 * 60 * 60 * 1000; // 90 days
  const veryRecentThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days

  let recentCount = 0;
  let veryRecentCount = 0;

  hnResults.hits.forEach(hit => {
    if (hit.created_at) {
      try {
        const createdTime = new Date(hit.created_at).getTime();
        const age = now - createdTime;

        if (age < veryRecentThreshold) {
          veryRecentCount++;
        } else if (age < recentThreshold) {
          recentCount++;
        }
      } catch {
        // Invalid date, skip
      }
    }
  });

  // Score based on recency distribution
  const total = hnResults.hits.length;
  if (veryRecentCount / total > 0.3) return 90; // Very recent
  if (veryRecentCount / total > 0.1 || recentCount / total > 0.5) return 70;
  if (recentCount / total > 0.2) return 50;
  return 30; // Old content
}

/**
 * Compute pain signal (0-100)
 */
function computePainSignal(googleResults: NormalizedEvidence["google"], hnResults: NormalizedEvidence["hackernews"]): number {
  let painScore = 0;

  // Check Google snippets for pain indicators
  const allSnippets = googleResults.queries.flatMap(q => q.items.map(item => item.snippet.toLowerCase()));
  let painMatches = 0;
  
  allSnippets.forEach(snippet => {
    PAIN_INDICATORS.forEach(indicator => {
      if (snippet.includes(indicator)) {
        painMatches++;
      }
    });
  });

  // Google component: 0-50 based on pain indicator density
  const snippetCount = allSnippets.length;
  if (snippetCount > 0) {
    const painDensity = painMatches / snippetCount;
    painScore += Math.min(50, painDensity * 100);
  }

  // HN component: 0-50 based on high-comment stories
  const highCommentStories = hnResults.hits.filter(hit => (hit.num_comments || 0) > 10).length;
  const totalStories = hnResults.hits.length;
  
  if (totalStories > 0) {
    const highCommentRatio = highCommentStories / totalStories;
    painScore += Math.min(50, highCommentRatio * 100);
  }

  return Math.min(100, painScore);
}

/**
 * Compute evidence coverage score (0-100)
 */
function computeEvidenceCoverage(
  googleResults: NormalizedEvidence["google"],
  competitors: Competitor[],
  hnResults: NormalizedEvidence["hackernews"]
): number {
  let score = 0;
  
  // Google results coverage (0-40)
  const googleItemCount = googleResults.queries.reduce((sum, q) => sum + q.items.length, 0);
  const uniqueDomains = new Set<string>();
  googleResults.queries.forEach(q => {
    q.items.forEach(item => {
      const domain = extractDomain(item.link);
      uniqueDomains.add(domain);
    });
  });
  
  if (googleItemCount >= 30) score += 40;
  else if (googleItemCount >= 20) score += 30;
  else if (googleItemCount >= 10) score += 20;
  else if (googleItemCount > 0) score += 10;
  
  // Competitor coverage (0-40)
  if (competitors.length >= 5) score += 40;
  else if (competitors.length >= 3) score += 30;
  else if (competitors.length >= 1) score += 20;
  
  // Pricing pages indicate mature market (0-10)
  const hasPricingPages = googleResults.queries.some(q => 
    q.items.some(item => 
      item.link.toLowerCase().includes("pricing") || 
      item.title.toLowerCase().includes("pricing")
    )
  );
  if (hasPricingPages) score += 10;
  
  // HN coverage (0-10) - bonus, not required
  if (hnResults.hits.length >= 5) score += 10;
  else if (hnResults.hits.length > 0) score += 5;
  
  return Math.min(100, score);
}

/**
 * Compute overall evidence score
 */
function computeOverallScore(
  competitorDensity: number,
  recencyScore: number,
  painSignal: number,
  evidenceCoverage: number
): number {
  // Weighted formula with coverage as quality indicator
  // Higher coverage = more reliable signals
  const coverageWeight = evidenceCoverage / 100;
  const adjustedCompetitor = competitorDensity * coverageWeight;
  const adjustedPain = painSignal * coverageWeight;
  const adjustedRecency = recencyScore * coverageWeight;
  
  const score = 
    (100 - adjustedCompetitor) * 0.35 +
    adjustedPain * 0.40 +
    adjustedRecency * 0.25;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Generate notes explaining signal computation
 */
function generateNotes(
  competitorDensity: number,
  recencyScore: number,
  painSignal: number,
  evidenceCoverage: number,
  marketEstablished: boolean,
  competitors: Competitor[],
  googleResults: NormalizedEvidence["google"],
  hnResults: NormalizedEvidence["hackernews"]
): string[] {
  const notes: string[] = [];
  const googleItemCount = googleResults.queries.reduce((sum, q) => sum + q.items.length, 0);
  const enterpriseCount = competitors.filter(c => isEnterpriseATS(c.domain)).length;

  notes.push(`Analyzed ${googleItemCount} Google search results and ${hnResults.hits.length} Hacker News stories`);
  notes.push(`Found ${competitors.length} competitor${competitors.length !== 1 ? 's' : ''} (${enterpriseCount} enterprise ATS${enterpriseCount !== 1 ? 'es' : ''})`);

  // Market established signal
  if (marketEstablished) {
    notes.push(`Market is ESTABLISHED: ${competitors.length} competitors found${enterpriseCount > 0 ? `, including enterprise ATS platforms` : ''}`);
  } else {
    notes.push(`Market establishment unclear: ${competitors.length} competitors found`);
  }

  if (competitorDensity > 70) {
    notes.push(`High competitor density (${Math.round(competitorDensity)}): Found many existing products in this space`);
  } else if (competitorDensity > 30) {
    notes.push(`Moderate competitor density (${Math.round(competitorDensity)}): Some existing solutions detected`);
  } else {
    notes.push(`Low competitor density (${Math.round(competitorDensity)}): Few direct competitors found`);
  }

  if (painSignal > 60) {
    notes.push(`Strong pain signals (${Math.round(painSignal)}): Users actively discussing problems related to this feature`);
  } else if (painSignal > 30) {
    notes.push(`Moderate pain signals (${Math.round(painSignal)}): Some evidence of user needs`);
  } else {
    notes.push(`Weak pain signals (${Math.round(painSignal)}): Limited evidence of active problem discussion`);
  }

  // HN caveat for B2B/HR tools
  if (hnResults.hits.length === 0 && enterpriseCount > 0) {
    notes.push(`Note: Hacker News may not represent recruiter/HR discussions - low HN activity is expected for B2B HR tools`);
  } else if (recencyScore > 70) {
    notes.push(`Recent activity (${Math.round(recencyScore)}): Current discussions and interest in related topics`);
  } else if (hnResults.hits.length > 0) {
    notes.push(`Mixed recency (${Math.round(recencyScore)}): Some historical interest, less recent activity`);
  }

  // Evidence coverage note
  if (evidenceCoverage < 30) {
    notes.push(`⚠️ Low evidence coverage (${Math.round(evidenceCoverage)}): Limited data - verdict confidence should reflect this`);
  } else {
    notes.push(`Evidence coverage: ${Math.round(evidenceCoverage)}/100 (${evidenceCoverage >= 70 ? 'good' : evidenceCoverage >= 50 ? 'moderate' : 'limited'})`);
  }

  return notes;
}

/**
 * Compute all signals from normalized evidence
 */
export function computeSignals(evidence: Omit<NormalizedEvidence, "signals">): NormalizedEvidence["signals"] {
  const competitors = evidence.competitors || [];
  const competitorDensity = computeCompetitorDensity(competitors);
  const marketEstablished = computeMarketEstablished(competitors);
  const recencyScore = computeRecencyScore(evidence.hackernews, competitors);
  const painSignal = computePainSignal(evidence.google, evidence.hackernews);
  const evidenceCoverage = computeEvidenceCoverage(evidence.google, competitors, evidence.hackernews);
  const overallScore = computeOverallScore(competitorDensity, recencyScore, painSignal, evidenceCoverage);

  const notes = generateNotes(
    competitorDensity,
    recencyScore,
    painSignal,
    evidenceCoverage,
    marketEstablished,
    competitors,
    evidence.google,
    evidence.hackernews
  );

  // Build perMetricEvidence for inline display
  const allGoogleItems = evidence.google.queries.flatMap(q => q.items);
  const topCompetitors = competitors.slice(0, 3).map(c => ({
    name: c.name,
    url: c.url,
    snippet: c.evidenceSnippets[0] || "",
  }));

  // Find pain indicators from Google snippets and HN
  const painIndicators: Array<{ title: string; url: string; snippet: string; source: "google" | "hackernews" }> = [];
  
  // From Google: find snippets with pain keywords
  for (const item of allGoogleItems) {
    const lowerSnippet = item.snippet.toLowerCase();
    if (PAIN_INDICATORS.some(indicator => lowerSnippet.includes(indicator)) && painIndicators.length < 3) {
      painIndicators.push({
        title: item.title,
        url: item.link,
        snippet: item.snippet.substring(0, 200),
        source: "google",
      });
    }
  }
  
  // From HN: high comment stories
  const highCommentStories = evidence.hackernews.hits
    .filter(hit => (hit.num_comments || 0) > 10)
    .slice(0, 2)
    .map(hit => ({
      title: hit.title,
      url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      snippet: `${hit.num_comments} comments - ${hit.points || 0} points`,
      source: "hackernews" as const,
    }));
  painIndicators.push(...highCommentStories);

  // Recent hits for recency evidence
  const recentHits = evidence.hackernews.hits
    .slice(0, 3)
    .filter(hit => hit.url)
    .map(hit => ({
      title: hit.title,
      url: hit.url!,
      date: hit.created_at || "Unknown",
      comments: hit.num_comments,
    }));

  // Count recent posts (last 90 days approximation)
  const now = Date.now();
  const ninetyDaysAgo = now - (90 * 24 * 60 * 60 * 1000);
  const recentCount = evidence.hackernews.hits.filter(hit => {
    if (!hit.created_at) return false;
    try {
      const hitDate = new Date(hit.created_at).getTime();
      return hitDate > ninetyDaysAgo;
    } catch {
      return false;
    }
  }).length;
  const recencySummary = `${recentCount} of ${evidence.hackernews.hits.length} posts in last 90 days`;

  // Evidence coverage details
  const pricingPages = allGoogleItems.filter(item => 
    item.link.toLowerCase().includes("pricing") || 
    item.title.toLowerCase().includes("pricing")
  ).length;

  const sampleCitations = [
    ...allGoogleItems.slice(0, 2).map(item => ({
      title: item.title,
      url: item.link,
      source: "google" as const,
    })),
    ...evidence.hackernews.hits.slice(0, 1).filter(hit => hit.url).map(hit => ({
      title: hit.title,
      url: hit.url!,
      source: "hackernews" as const,
    })),
  ];

  return {
    competitor_density: competitorDensity,
    recency_score: recencyScore,
    pain_signal: painSignal,
    overall_evidence_score: overallScore,
    evidenceCoverage,
    marketEstablished,
    notes,
    perMetricEvidence: {
      competitorDensity: {
        competitors: topCompetitors,
      },
      painSignal: {
        indicators: painIndicators.slice(0, 3),
      },
      recency: {
        recentHits: recentHits.slice(0, 3),
        summary: recencySummary,
      },
      evidenceCoverage: {
        counts: {
          google: allGoogleItems.length,
          hn: evidence.hackernews.hits.length,
          competitors: competitors.length,
          pricingPages,
        },
        sampleCitations: sampleCitations.slice(0, 2),
      },
    },
  };
}

