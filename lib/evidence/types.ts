// Evidence types for external API integrations

export interface EvidenceQueryInput {
  query: string;
  keywords?: string[];
  mode?: "idea" | "feature";
}

export interface GoogleCseItem {
  title: string;
  snippet: string;
  link: string;
  displayLink?: string;
}

export interface GoogleCseQueryResult {
  q: string;
  items: GoogleCseItem[];
}

export interface HackerNewsHit {
  title: string;
  url?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
  objectID: string;
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
    queries: GoogleCseQueryResult[];
  };
  hackernews: {
    hits: HackerNewsHit[];
  };
  competitors: Competitor[];
  competitorSummary: CompetitorSummary;
  signals: {
    competitor_density: number; // 0-100
    recency_score: number; // 0-100
    pain_signal: number; // 0-100
    overall_evidence_score: number; // 0-100
    evidenceCoverage: number; // 0-100
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
    type: "missing_config" | "api_error" | "no_results" | "low_coverage";
    message: string;
    details?: string;
  }>;
  generatedAt: string; // ISO timestamp
}

export interface EvidenceSearchResponse {
  evidence: NormalizedEvidence;
  evidenceMissing?: boolean;
}

