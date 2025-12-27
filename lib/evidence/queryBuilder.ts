// Advanced query generation for better competitor discovery
import { deriveKeywords } from "./keywords";

export interface QueryBuilderInput {
  query: string;
  keywords?: string[];
}

/**
 * Detect if query is job/resume/recruiting related
 */
function isJobRelated(query: string, keywords: string[]): boolean {
  const jobTerms = [
    "resume", "cv", "ats", "applicant", "recruiting", "hiring", "job", "career",
    "candidate", "employment", "background check", "verification", "screening",
    "talent", "recruiter", "hr", "human resources"
  ];
  
  const combined = `${query} ${keywords.join(" ")}`.toLowerCase();
  return jobTerms.some(term => combined.includes(term));
}

/**
 * Build strategic search queries for competitor discovery
 */
export function buildSearchQueries(input: QueryBuilderInput): string[] {
  const keywords = input.keywords || deriveKeywords(input.query);
  const keywordString = keywords.slice(0, 5).join(" ");
  const isJobDomain = isJobRelated(input.query, keywords);
  
  if (!keywordString.trim()) return [];

  const queries: string[] = [];

  // Core product searches (always include)
  queries.push(`${keywordString} software`);
  queries.push(`${keywordString} tool`);
  queries.push(`${keywordString} pricing`);
  queries.push(`${keywordString} alternatives`);

  // Domain-specific additions
  if (isJobDomain) {
    queries.push(`${keywordString} ATS`);
    queries.push(`${keywordString} for recruiters`);
  } else {
    queries.push(`${keywordString} platform`);
  }

  // Competitor discovery queries
  queries.push(`best ${keywordString} tools`);
  queries.push(`top ${keywordString} software`);

  // Category-specific queries for job domain
  if (isJobDomain) {
    // Add specific competitor discovery queries
    if (keywords.some(k => k.includes("resume") || k.includes("cv"))) {
      queries.push("ATS resume parsing software");
      queries.push("resume screening automation tool");
    }
    if (keywords.some(k => k.includes("verif") || k.includes("background"))) {
      queries.push("employment verification API background check");
      queries.push("identity verification service");
    }
  }

  // Buyer intent query
  if (isJobDomain) {
    queries.push(`${keywordString} for hiring teams`);
  } else {
    queries.push(`${keywordString} enterprise solution`);
  }

  // Cap at 8 queries (remove duplicates, take first 8)
  const uniqueQueries = Array.from(new Set(queries));
  return uniqueQueries.slice(0, 8);
}

