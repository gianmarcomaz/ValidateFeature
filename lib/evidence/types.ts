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
  };
  citations: Array<{
    source: "google" | "hackernews";
    title: string;
    url: string;
  }>;
  generatedAt: string; // ISO timestamp
}

export interface EvidenceSearchResponse {
  evidence: NormalizedEvidence;
  evidenceMissing?: boolean;
}

