import { z } from "zod";
import { zodToJsonSchema as zodToJson } from "zod-to-json-schema";

// Zod schemas for structured LLM outputs

export const NormalizedFeatureSchema = z.object({
  problemStatement: z.string().describe("Clear, concise problem statement based on the feature idea"),
  targetUserSummary: z.string().describe("Summary of the ideal customer profile and target user"),
  successMetricDefinition: z.string().describe("Specific definition of how success will be measured"),
  keywordQuerySet: z.array(z.string()).min(10).max(20).describe("10-20 relevant keywords for search/trend analysis"),
  clarifyingQuestions: z.array(z.string()).max(3).describe("0-3 clarifying questions that would help validate the idea further"),
});

export type NormalizedFeature = z.infer<typeof NormalizedFeatureSchema>;

export const EvidenceCitationSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string().nullable().optional(), // Nullable for OpenAI strict mode compatibility
  source: z.enum(["google", "hackernews", "website"]),
});

export const VerdictReasonSchema = z.object({
  title: z.string(),
  detail: z.string(),
  evidenceCitations: z.array(EvidenceCitationSchema).optional(),
});

export const PivotOptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  whyStronger: z.string(),
  smallestMVP: z.string(),
  whoToTarget: z.string().nullable().optional(), // Nullable for OpenAI strict mode
  whatToBuild: z.string().nullable().optional(), // Nullable for OpenAI strict mode
  week1Experiment: z.string().nullable().optional(), // Nullable for OpenAI strict mode
  successMetric: z.string().nullable().optional(), // Nullable for OpenAI strict mode
});

export const TransparencyInfoSchema = z.object({
  assumptions: z.array(z.string()),
  limitations: z.array(z.string()),
  methodology: z.array(z.string()),
});

export const CompetitorAnalysisSchema = z.object({
  name: z.string(),
  category: z.string(),
  whatTheyDo: z.string(),
  whyOverlaps: z.string(),
  link: z.string(),
});

export const VerdictResponseSchema = z.object({
  verdict: z.enum(["BUILD", "RISKY", "DONT_BUILD"]),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  reasons: z.array(VerdictReasonSchema).min(3).max(6),
  pivotOptions: z.array(PivotOptionSchema).min(2).max(3),
  competitorAnalysis: z.array(CompetitorAnalysisSchema).min(0).max(5),
  transparency: TransparencyInfoSchema,
});

export type VerdictResponse = z.infer<typeof VerdictResponseSchema>;

export const ValidationTestSchema = z.object({
  type: z.enum(["fake-door", "micro-poll", "waitlist", "interview"]),
  steps: z.array(z.string()),
  successThreshold: z.string(),
});

export const SurveyQuestionSchema = z.object({
  question: z.string(),
  type: z.enum(["text", "multiple-choice", "scale", "boolean"]),
  options: z.array(z.string()).nullable().optional(), // Nullable for OpenAI strict mode
  required: z.boolean(),
});

export const OutreachTemplateSchema = z.object({
  platform: z.enum(["linkedin", "email"]),
  subject: z.string().nullable().optional(), // Nullable for OpenAI strict mode
  body: z.string(),
});

export const ValidationSprintSchema = z.object({
  tests: z.array(ValidationTestSchema).min(1).max(3),
  survey: z.object({
    questions: z.array(SurveyQuestionSchema).min(8).max(12),
    intro: z.string(),
  }),
  outreachTemplates: z.array(OutreachTemplateSchema),
});

export type ValidationSprint = z.infer<typeof ValidationSprintSchema>;

// Helper to convert Zod schema to JSON Schema for OpenAI
// OpenAI strict mode requires ALL properties to be in 'required' array
// Optional/nullable fields are still included in required but can be null
export function zodToJsonSchema(schema: z.ZodType): any {
  const jsonSchema = zodToJson(schema, {
    target: "openApi3",
    $refStrategy: "none",
  });
  
  // Recursively ensure all properties are in required array (OpenAI strict mode requirement)
  function ensureAllRequired(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(ensureAllRequired);
    }
    
    const fixed: any = { ...obj };
    
    // If this is an object with properties, ensure ALL properties are in required array
    if (fixed.properties && typeof fixed.properties === 'object') {
      const allPropertyKeys = Object.keys(fixed.properties);
      // OpenAI strict mode: ALL properties must be in required array
      fixed.required = allPropertyKeys;
      
      // Recursively fix nested properties
      for (const key in fixed.properties) {
        fixed.properties[key] = ensureAllRequired(fixed.properties[key]);
      }
    }
    
    // Recursively fix items in arrays
    if (fixed.items) {
      fixed.items = ensureAllRequired(fixed.items);
    }
    
    // Recursively fix other nested objects
    for (const key in fixed) {
      if (key !== 'properties' && key !== 'required' && key !== 'items' && typeof fixed[key] === 'object') {
        fixed[key] = ensureAllRequired(fixed[key]);
      }
    }
    
    return fixed;
  }
  
  return ensureAllRequired(jsonSchema);
}

