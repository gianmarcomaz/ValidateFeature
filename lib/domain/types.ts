// Domain types for FeatureValidate

export type Mode = "early" | "existing";

export type GoalMetric = "activation" | "retention" | "revenue" | "support";

export interface FeatureInput {
  title: string;
  description: string;
}

export interface ICPInput {
  role: string;
  industry?: string;
  companySize?: string;
}

export interface SubmissionInput {
  mode: Mode;
  feature: FeatureInput;
  icp: ICPInput;
  goalMetric: GoalMetric;
}

export interface NormalizedFeature {
  problemStatement: string;
  targetUserSummary: string;
  successMetricDefinition: string;
  keywordQuerySet: string[];
  clarifyingQuestions: string[];
}

export type Verdict = "BUILD" | "RISKY" | "DONT_BUILD";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";

export interface VerdictReason {
  title: string;
  detail: string;
}

export interface PivotOption {
  name: string;
  description: string;
  whyStronger: string;
  smallestMVP: string;
}

export interface TransparencyInfo {
  assumptions: string[];
  limitations: string[];
  methodology: string[];
}

export interface CompetitorAnalysis {
  name: string;
  category: string;
  whatTheyDo: string;
  whyOverlaps: string;
  link: string;
}

export interface VerdictResponse {
  verdict: Verdict;
  confidence: Confidence;
  reasons: VerdictReason[];
  pivotOptions: PivotOption[];
  competitorAnalysis?: CompetitorAnalysis[];
  transparency: TransparencyInfo;
}

export interface Signals {
  trends?: {
    status: "TODO" | "complete";
    data?: any;
  };
  community?: {
    status: "TODO" | "complete";
    data?: any;
  };
  competitors?: {
    status: "TODO" | "complete";
    data?: any;
  };
}

export interface ValidationTest {
  type: "fake-door" | "micro-poll" | "waitlist" | "interview";
  steps: string[];
  successThreshold: string;
}

export interface SurveyQuestion {
  question: string;
  type: "text" | "multiple-choice" | "scale" | "boolean";
  options?: string[];
  required: boolean;
}

export interface OutreachTemplate {
  platform: "linkedin" | "email";
  subject?: string;
  body: string;
}

export interface ValidationSprint {
  tests: ValidationTest[];
  survey: {
    questions: SurveyQuestion[];
    intro: string;
  };
  outreachTemplates: OutreachTemplate[];
}

