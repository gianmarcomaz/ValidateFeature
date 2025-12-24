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

export const VerdictReasonSchema = z.object({
  title: z.string(),
  detail: z.string(),
});

export const PivotOptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  whyStronger: z.string(),
  smallestMVP: z.string(),
});

export const TransparencyInfoSchema = z.object({
  assumptions: z.array(z.string()),
  limitations: z.array(z.string()),
  methodology: z.array(z.string()),
});

export const VerdictResponseSchema = z.object({
  verdict: z.enum(["BUILD", "RISKY", "DONT_BUILD"]),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
  reasons: z.array(VerdictReasonSchema).min(3).max(6),
  pivotOptions: z.array(PivotOptionSchema).min(2).max(3),
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
  options: z.array(z.string()).optional(),
  required: z.boolean(),
});

export const OutreachTemplateSchema = z.object({
  platform: z.enum(["linkedin", "email"]),
  subject: z.string().optional(),
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
export function zodToJsonSchema(schema: z.ZodType): any {
  return zodToJson(schema);
}

