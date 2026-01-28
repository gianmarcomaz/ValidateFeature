// Evidence types for external API integrations

export interface EvidenceQueryInput {
  query: string;
  keywords?: string[];
  mode?: "idea" | "feature";
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


export interface GoogleCseItem {
  title: string;
  snippet: string;
  link: string;
  displayLink?: string;
  // CRITICAL: Google stores dates and metadata here
  pagemap?: {
    metatags?: Array<Record<string, string>>;
    cse_image?: Array<{ src: string }>;
    cse_thumbnail?: Array<{ src: string; width: string; height: string }>;
  };
}

export interface GoogleCseQueryResult {
  q: string;
  items: GoogleCseItem[];
  totalResults?: string; // Helpful for "marketEstablished" signal
}
export interface HackerNewsHit {
  title: string;
  url?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
  objectID: string;
  _highlightResult?: any; // Useful if you want to show why it matched
}
export interface Competitor {
  name: string;
  domain: string;
  url: string;
  category: "ATS" | "Resume Optimizer" | "Screening/Matching" | "Verification/Background" | "Other";
  overlapReason: string;
  evidenceSnippets: string[];
  confidence: "high" | "med" | "low";
}

export interface CompetitorSummary {
  totalCompetitorsFound: number;
  topCompetitors: string[];
  saturationSignal: "low" | "medium" | "high";
}

export interface NormalizedEvidence {
  google: {
    configured: boolean;
    status?: "success" | "error" | "blocked"; // Added for debugging 403s
    errorDetails?: string; // Store the "PERMISSION_DENIED" message here
    queries: GoogleCseQueryResult[];
  };
  hackernews: {
    status?: "success" | "error";
    hits: HackerNewsHit[];
  };
  competitors: Competitor[];
  competitorSummary: CompetitorSummary;
  signals: {
    competitor_density: number; 
    recency_score: number; 
    pain_signal: number; 
    overall_evidence_score: number; 
    evidenceCoverage: number; 
    marketEstablished: boolean;
    notes: string[];
    perMetricEvidence?: {
      competitorDensity: {
        competitors: Array<{ name: string; url: string; snippet: string }>;
      };
      painSignal: {
        indicators: Array<{ title: string; url: string; snippet: string; source: "google" | "hackernews" }>;
      };
      recency: {
        recentHits: Array<{ title: string; url: string; date: string; comments?: number }>;
        summary: string;
      };
      evidenceCoverage: {
        counts: { google: number; hn: number; competitors: number; pricingPages: number };
        sampleCitations: Array<{ title: string; url: string; source: "google" | "hackernews" }>;
      };
    };
  };
  citations: Array<{
    source: "google" | "hackernews";
    title: string;
    url: string;
    snippet?: string;
    date?: string;
  }>;
  warnings?: Array<{
    type: "missing_config" | "api_error" | "no_results" | "low_coverage" | "quota_exceeded" | "access_denied";
    message: string;
    details?: string; // This is where you put the 403 "Project Access" body
  }>;
  generatedAt: string; 
}


export interface EvidenceSearchResponse {
  evidence: NormalizedEvidence;
  evidenceMissing?: boolean;
}

