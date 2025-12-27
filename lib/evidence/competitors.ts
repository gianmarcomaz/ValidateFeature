// Competitor extraction from Google CSE results
import { GoogleCseQueryResult, GoogleCseItem } from "./types";

export type CompetitorCategory = "ATS" | "Resume Optimizer" | "Screening/Matching" | "Verification/Background" | "Other";

export interface Competitor {
  name: string;
  domain: string;
  url: string;
  category: CompetitorCategory;
  overlapReason: string;
  evidenceSnippets: string[];
  confidence: "high" | "med" | "low";
}

// Known enterprise ATS domains for market saturation signals
const ENTERPRISE_ATS_DOMAINS = [
  "workday", "icims", "greenhouse", "lever", "smartrecruiters", 
  "jobvite", "taleo", "cornerstone", "peoplefluent", "successfactors",
  "adp", "ultipro", "bamboohr", "zenefits"
];

// Product indicators in domains
const PRODUCT_INDICATORS = ["app", "software", "saas", "pricing", "product", "solutions", "platform", "tools"];

// Category keywords for classification
const CATEGORY_KEYWORDS: Record<CompetitorCategory, string[]> = {
  "ATS": ["ATS", "applicant tracking", "talent acquisition", "recruiting software", "hiring platform", "talent management"],
  "Resume Optimizer": ["resume optimization", "ATS keyword", "resume checker", "resume analyzer", "resume builder", "resume scanner"],
  "Screening/Matching": ["resume screening", "candidate matching", "resume parsing", "skill matching", "screening tool", "matching algorithm"],
  "Verification/Background": ["background check", "employment verification", "identity verification", "candidate verification", "credential check"],
  "Other": []
};

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Extract company name from title/domain
 */
function extractCompanyName(title: string, domain: string): string {
  // Try to get name from title (before common separators)
  const titleName = title
    .split(/[-|–—:•]/)[0]
    .replace(/\s*(software|tool|platform|app|solution|ATS).*$/i, "")
    .trim();

  if (titleName.length > 2 && titleName.length < 50) {
    return titleName;
  }

  // Fallback to domain (remove TLD and common prefixes)
  const domainParts = domain.split(".");
  return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
}

/**
 * Check if domain matches enterprise ATS
 */
function isEnterpriseATS(domain: string): boolean {
  return ENTERPRISE_ATS_DOMAINS.some(ats => domain.includes(ats));
}

/**
 * Check if domain looks like a product/service
 */
function isProductDomain(domain: string): boolean {
  return PRODUCT_INDICATORS.some(indicator => domain.includes(indicator));
}

/**
 * Compute competitor likelihood score
 */
function computeCompetitorScore(item: GoogleCseItem, domain: string): number {
  let score = 0;
  const text = `${item.title} ${item.snippet}`.toLowerCase();

  // High-value indicators
  if (isEnterpriseATS(domain)) score += 50;
  if (isProductDomain(domain)) score += 20;

  // Category keyword matches
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    const matches = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    if (category !== "Other" && matches > 0) {
      score += matches * 10;
    }
  });

  // Additional product indicators in text
  const productTerms = ["pricing", "free trial", "demo", "features", "integrations", "api"];
  productTerms.forEach(term => {
    if (text.includes(term)) score += 5;
  });

  // Negative indicators (reduce score)
  if (text.includes("how to build") || text.includes("tutorial")) score -= 10;
  if (text.includes("github.com") && !text.includes("enterprise")) score -= 5;

  return Math.max(0, score);
}

/**
 * Classify competitor category
 */
function classifyCategory(item: GoogleCseItem, domain: string): CompetitorCategory {
  const text = `${item.title} ${item.snippet}`.toLowerCase();
  const scores: Record<CompetitorCategory, number> = {
    "ATS": 0,
    "Resume Optimizer": 0,
    "Screening/Matching": 0,
    "Verification/Background": 0,
    "Other": 0,
  };

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    if (category !== "Other") {
      scores[category as CompetitorCategory] = keywords.reduce((sum, kw) => {
        return sum + (text.includes(kw.toLowerCase()) ? 1 : 0);
      }, 0);
    }
  });

  // Enterprise ATS detection
  if (isEnterpriseATS(domain)) {
    scores["ATS"] += 5;
  }

  const maxCategory = Object.entries(scores).reduce((max, [cat, score]) => 
    score > max[1] ? [cat, score] : max
  );

  return maxCategory[1] > 0 ? maxCategory[0] as CompetitorCategory : "Other";
}

/**
 * Generate overlap reason from evidence
 */
function generateOverlapReason(item: GoogleCseItem, category: CompetitorCategory): string {
  const snippet = item.snippet.substring(0, 200);
  
  if (category === "ATS") {
    return `ATS platform that handles resume parsing and candidate tracking`;
  } else if (category === "Resume Optimizer") {
    return `Resume optimization tool that helps candidates improve ATS compatibility`;
  } else if (category === "Screening/Matching") {
    return `Automated screening and matching solution for candidate evaluation`;
  } else if (category === "Verification/Background") {
    return `Background check and employment verification service`;
  }
  
  return `Related solution in the hiring/recruitment space`;
}

/**
 * Determine confidence level
 */
function determineConfidence(score: number, isEnterprise: boolean): "high" | "med" | "low" {
  if (isEnterprise || score >= 40) return "high";
  if (score >= 20) return "med";
  return "low";
}

/**
 * Extract competitors from Google CSE results
 */
export function extractCompetitorsFromGoogle(results: GoogleCseQueryResult[]): Competitor[] {
  const competitorsMap = new Map<string, {
    item: GoogleCseItem;
    domain: string;
    score: number;
  }>();

  // Process all results
  results.forEach(queryResult => {
    queryResult.items.forEach(item => {
      const domain = extractDomain(item.link);
      
      // Skip non-product domains
      if (!isProductDomain(domain) && !isEnterpriseATS(domain)) {
        // Allow if title/snippet suggests product
        const text = `${item.title} ${item.snippet}`.toLowerCase();
        const hasProductTerms = PRODUCT_INDICATORS.some(term => text.includes(term)) ||
          Object.values(CATEGORY_KEYWORDS).flat().some(kw => text.includes(kw.toLowerCase()));
        
        if (!hasProductTerms) return;
      }

      const score = computeCompetitorScore(item, domain);
      
      // Only keep competitors with meaningful scores
      if (score < 10) return;

      // Deduplicate by domain, keeping highest score
      const existing = competitorsMap.get(domain);
      if (!existing || score > existing.score) {
        competitorsMap.set(domain, { item, domain, score });
      }
    });
  });

  // Convert to Competitor objects
  const competitors: Competitor[] = Array.from(competitorsMap.values())
    .map(({ item, domain, score }) => {
      const category = classifyCategory(item, domain);
      const isEnterprise = isEnterpriseATS(domain);
      const confidence = determineConfidence(score, isEnterprise);

      return {
        name: extractCompanyName(item.title, domain),
        domain,
        url: item.link,
        category,
        overlapReason: generateOverlapReason(item, category),
        evidenceSnippets: [item.snippet.substring(0, 150)],
        confidence,
      };
    })
    .sort((a, b) => {
      // Sort by: enterprise ATS first, then by score
      const aEnterprise = isEnterpriseATS(a.domain) ? 1000 : 0;
      const bEnterprise = isEnterpriseATS(b.domain) ? 1000 : 0;
      const aScore = competitorsMap.get(a.domain)?.score || 0;
      const bScore = competitorsMap.get(b.domain)?.score || 0;
      return (bEnterprise + bScore) - (aEnterprise + aScore);
    });

  // Return top 8
  return competitors.slice(0, 8);
}

