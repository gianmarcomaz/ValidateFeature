// Prompt templates for LLM calls
import { VerdictResponse } from "./schemas";

export function getNormalizePrompt(feature: { title: string; description: string }, icp: { role: string; industry?: string; companySize?: string }, goalMetric: string, mode: "early" | "existing"): string {
  return `You are a product validation assistant. Your task is to normalize and clarify a feature idea into structured components.

Feature Idea:
Title: ${feature.title}
Description: ${feature.description}

Target User (ICP):
Role: ${icp.role}
${icp.industry ? `Industry: ${icp.industry}` : ""}
${icp.companySize ? `Company Size: ${icp.companySize}` : ""}

Goal Metric: ${goalMetric}
Mode: ${mode === "early" ? "Early-stage founder" : "Existing startup"}

Please normalize this into:
1. A clear problem statement
2. A concise target user summary
3. A specific success metric definition
4. 10-20 relevant keywords for search/trend analysis
5. 0-3 clarifying questions that would help validate this idea further

Be specific, actionable, and focus on what can be measured.`;
}

export function getVerdictPrompt(
  normalized: any,
  feature: { title: string; description: string },
  icp: { role: string; industry?: string; companySize?: string },
  goalMetric: string,
  mode: "early" | "existing",
  signalsUnavailable: boolean
): string {
  return `You are a product validation expert. Analyze this feature idea and provide a verdict.

Feature: ${feature.title}
${feature.description}

Normalized Analysis:
${JSON.stringify(normalized, null, 2)}

Target User: ${icp.role}${icp.industry ? ` in ${icp.industry}` : ""}
Goal Metric: ${goalMetric}
Mode: ${mode === "early" ? "Early-stage founder" : "Existing startup"}

${signalsUnavailable ? `⚠️ IMPORTANT: External market signals (Google Trends, Reddit, competitor analysis) are NOT available yet. Base your verdict on:
- Problem clarity and specificity
- Target user definition quality
- General market heuristics
- Mode context (early vs existing startup)

Your confidence level MUST reflect that signals are missing - typically MEDIUM or LOW unless the problem is exceptionally clear and well-defined.` : "Use available signals to inform your verdict."}

Provide:
1. Verdict: BUILD (strong validation), RISKY (needs more validation), or DONT_BUILD (poor fit)
2. Confidence: HIGH, MEDIUM, or LOW (must reflect missing signals if applicable)
3. 3-6 reasons with clear titles and details
4. 2-3 pivot/refine options with smaller MVPs
5. Transparency section covering assumptions, limitations, and methodology

Be honest and actionable. If confidence is low due to missing signals, state this clearly.`;
}

export function getSprintPrompt(
  verdict: VerdictResponse,
  normalized: any,
  feature: { title: string; description: string }
): string {
  return `Generate a validation sprint plan to increase confidence in this feature idea.

Feature: ${feature.title}

Current Verdict: ${verdict.verdict} (${verdict.confidence} confidence)
Reasons:
${verdict.reasons.map(r => `- ${r.title}: ${r.detail}`).join("\n")}

Normalized Feature:
${JSON.stringify(normalized, null, 2)}

Create a validation sprint with:
1. 1-3 fast validation tests (fake-door, micro-poll, waitlist, or interview scripts)
   - Each test should have clear steps and success thresholds
2. An 8-12 question survey that includes:
   - Role/experience fields
   - Willingness-to-pay questions
   - Alternative solution questions
   - Problem validation questions
3. Short outreach templates for LinkedIn and email to recruit participants

Focus on tests that can be run quickly (days, not weeks) and provide actionable validation signals.`;
}

