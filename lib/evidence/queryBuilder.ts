// Advanced query generation for better competitor discovery
import { deriveKeywords } from "./keywords";

export interface QueryBuilderInput {
  query: string;
  keywords?: string[];
  startup?: {
    name?: string;
    targetAudience?: string;
    problemSolved?: string;
    websiteUrl?: string;
  };
  feature?: {
    title?: string;
    description?: string;
    problemSolved?: string;
    targetAudience?: string;
  };
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
 * Now uses startup + feature context for more precise queries
 */
export function buildSearchQueries(input: QueryBuilderInput): string[] {
  const keywords = input.keywords || deriveKeywords(input.query);
  const keywordString = keywords.slice(0, 5).join(" ");
  const isJobDomain = isJobRelated(input.query, keywords);
  
  if (!keywordString.trim()) return [];

  const queries: string[] = [];

  // Use startup context if available
  const startupName = input.startup?.name;
  const startupTargetAudience = input.startup?.targetAudience;
  const startupProblem = input.startup?.problemSolved;
  const featureTitle = input.feature?.title;
  const featureTargetAudience = input.feature?.targetAudience;
  const featureProblem = input.feature?.problemSolved;

  // Core product searches (always include)
  queries.push(`${keywordString} software`);
  queries.push(`${keywordString} tool`);
  queries.push(`${keywordString} pricing`);
  queries.push(`${keywordString} alternatives`);

  // Enhanced queries using startup context
  if (startupName && startupName !== "unknown") {
    queries.push(`${startupName} competitors`);
    queries.push(`alternatives to ${startupName}`);
  }

  if (startupTargetAudience && startupTargetAudience !== "unknown") {
    queries.push(`${keywordString} for ${startupTargetAudience}`);
  }

  if (startupProblem && startupProblem !== "unknown") {
    const problemKeywords = deriveKeywords(startupProblem).slice(0, 3).join(" ");
    if (problemKeywords) {
      queries.push(`${problemKeywords} solution`);
    }
  }

  // Feature-specific queries
  if (featureTitle) {
    queries.push(`${featureTitle} alternatives`);
  }

  if (featureTargetAudience && featureTargetAudience !== "unknown") {
    queries.push(`${keywordString} ${featureTargetAudience}`);
  }

  if (featureProblem && featureProblem !== "unknown") {
    const featureProblemKeywords = deriveKeywords(featureProblem).slice(0, 3).join(" ");
    if (featureProblemKeywords) {
      queries.push(`${featureProblemKeywords} tool`);
    }
  }

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

  // Cap at 10 queries (remove duplicates, take first 10)
  const uniqueQueries = Array.from(new Set(queries));
  return uniqueQueries.slice(0, 10);
}

