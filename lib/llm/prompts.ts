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
  feature: { title: string; description: string; problemSolved?: string; targetAudience?: string },
  icp: { role: string; industry?: string; companySize?: string },
  goalMetric: string,
  mode: "early" | "existing",
  signalsUnavailable: boolean,
  evidence?: any,
  startup?: any
): string {
  let evidenceSection = "";
  let hardConstraints = "";
  
  if (evidence && evidence.signals) {
    const signals = evidence.signals;
    const competitors = evidence.competitors || [];
    const competitorSummary = evidence.competitorSummary || { totalCompetitorsFound: 0, saturationSignal: "low" as const };
    const googleQueries = evidence.google?.queries?.map((q: any) => q.q) || [];
    const googleCount = evidence.google?.queries?.reduce((sum: number, q: any) => sum + (q.items?.length || 0), 0) || 0;
    const hnCount = evidence.hackernews?.hits?.length || 0;
    const marketEstablished = signals.marketEstablished || false;
    const evidenceCoverage = signals.evidenceCoverage || 0;
    
    // Build competitor list for prompt
    const competitorList = competitors.slice(0, 10).map((c: any) => 
      `- ${c.name} (${c.category}): ${c.overlapReason} [${c.url}]`
    ).join("\n");

    evidenceSection = `
EVIDENCE FROM EXTERNAL SOURCES:

Market Status:
- Market Established: ${marketEstablished ? "YES" : "NO"} ${marketEstablished ? "- This is an established market with existing players" : "- Market establishment unclear from evidence"}
- Competitors Found: ${competitors.length} competitors
- Saturation Signal: ${competitorSummary.saturationSignal.toUpperCase()} (${competitorSummary.saturationSignal === "high" ? "Market appears saturated" : competitorSummary.saturationSignal === "medium" ? "Moderate competition" : "Low competition detected"})
${competitors.length >= 3 ? `- Top Competitors:\n${competitorList}` : "- No significant competitors found"}

Evidence Signals:
- Competitor Density: ${Math.round(signals.competitor_density)}/100
- Pain Signal: ${Math.round(signals.pain_signal)}/100
- Recency Score: ${Math.round(signals.recency_score)}/100
- Evidence Coverage: ${Math.round(evidenceCoverage)}/100 ${evidenceCoverage < 30 ? "(LOW - limited data)" : evidenceCoverage < 70 ? "(MODERATE)" : "(GOOD)"}
- Overall Evidence Score: ${Math.round(signals.overall_evidence_score)}/100

Search Results:
- Google CSE: ${googleCount} results from ${googleQueries.length} queries
- Hacker News: ${hnCount} stories
- Sample queries used: ${googleQueries.slice(0, 5).join(", ")}

Evidence Notes:
${signals.notes?.map((note: string) => `- ${note}`).join("\n") || "- No additional notes"}

Top Google Snippets (for context):
${evidence.google?.queries?.flatMap((q: any) => q.items?.slice(0, 2).map((item: any) => `- ${item.title}: ${item.snippet.substring(0, 150)}...`)).slice(0, 5).join("\n") || "- No snippets available"}`;

    // Hard constraints based on evidence
    hardConstraints = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL CONSTRAINTS - YOU MUST FOLLOW THESE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EVIDENCE-BASED REASONING (MANDATORY):
   - Use ONLY the evidence provided above. Do NOT claim facts not in the evidence.
   - If evidence shows ${competitors.length} competitors found, you MUST acknowledge this.
   - If marketEstablished=true, you MUST state the market is established in your reasons.
   - If startup context is provided, use ONLY facts from startup context or websiteEvidence. If field is "unknown", state that.

2. NEVER CLAIM "NO COMPETITORS" OR "NO MARKET" IF:
   - competitors.length >= 3, OR
   - marketEstablished=true, OR
   - any enterprise ATS (Workday, iCIMS, Greenhouse, etc.) was found
   
   If these conditions are met, you MUST say the market is established/saturated.

3. INSUFFICIENT EVIDENCE HANDLING:
   - If evidenceCoverage < 30, you MUST:
     * Lower confidence to LOW or MEDIUM
     * State "insufficient evidence" in methodology
     * Do NOT guess about market status
   - If startup context has "unknown" fields, mention this in limitations

4. VERDICT "RISKY" MEANS:
   - Market is saturated/competitive (NOT "no market")
   - Differentiation is unclear
   - Wrong buyer segment (B2C vs enterprise mismatch)
   - Compliance/data sensitivity adds friction
   
   "Risky" does NOT mean "no demand" or "no competitors found".

5. COMPETITOR ANALYSIS (REQUIRED):
   - Include competitorAnalysis array with top 5 competitors from the list above
   - For each competitor: name, category, whatTheyDo (1 sentence), whyOverlaps (1 sentence), link
   - Reference actual competitors found, not hypothetical ones

6. REASONS WITH CITATIONS:
   - Each reason MUST include evidenceCitations array when evidence is available
   - Citations should reference: Google results, HN posts, or websiteEvidence pages
   - Format: {title, url, snippet (first 150 chars), source: "google"|"hackernews"|"website"}
   - If no evidence available for a reason, state that in the reason detail

7. METHODOLOGY (MUST INCLUDE):
   - List the Google CSE queries used (show 5 sample queries)
   - Explain competitor extraction method (found via Google search)
   - Note that HN may not represent recruiter/HR discussions when HN hits are low
   - Mention evidence coverage level
   - If websiteEvidence was used, mention which pages were analyzed

8. TRANSPARENCY:
   - If market is established but verdict is RISKY, explain why (saturation, differentiation, etc.)
   - If competitors found but not mentioned, explain reasoning
   - Always cite evidence (e.g., "Based on ${googleCount} search results, we found ${competitors.length} competitors including...")
   - If startup context incomplete, state what's missing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  } else {
    evidenceSection = `
⚠️ IMPORTANT: External market signals (Google Trends, Reddit, competitor analysis) are NOT available.
Base your verdict on problem clarity, target user definition, and general heuristics only.
Your confidence level MUST be MEDIUM or LOW (never HIGH without evidence).`;
    
    hardConstraints = `
CRITICAL: Without external evidence, you MUST:
- Set confidence to MEDIUM or LOW
- State clearly in methodology that external evidence was unavailable
- Do NOT claim market status without evidence`;
  }

  // Build startup context section
  let startupSection = "";
  if (startup) {
    startupSection = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STARTUP CONTEXT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Startup Name: ${startup.name || "unknown"}
Description: ${startup.description || "unknown"}
What It Does: ${startup.whatItDoes || "unknown"}
Problem Solved: ${startup.problemSolved || "unknown"}
Target Audience: ${startup.targetAudience || "unknown"}
${startup.businessModel ? `Business Model: ${startup.businessModel}` : ""}
${startup.differentiators && startup.differentiators.length > 0 ? `Differentiators: ${startup.differentiators.join(", ")}` : ""}
${startup.websiteUrl ? `Website: ${startup.websiteUrl}` : ""}

${startup.websiteEvidence ? `
Website Evidence (${startup.websiteEvidence.pages?.length || 0} pages fetched):
${startup.websiteEvidence.pages?.map((p: any) => `- ${p.url}${p.title ? ` - ${p.title}` : ""}\n  ${p.snippet.substring(0, 200)}...`).join("\n") || "No pages"}
${startup.websiteEvidence.warnings && startup.websiteEvidence.warnings.length > 0 ? `\nWarnings: ${startup.websiteEvidence.warnings.join(", ")}` : ""}
` : ""}

CRITICAL: Use ONLY facts from startup context or websiteEvidence. If information is "unknown", do NOT invent facts.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  }

  return `You are a product validation expert. Analyze this feature idea and provide a verdict.

${startupSection}
Feature: ${feature.title}
${feature.description}
${feature.problemSolved ? `\nProblem Solved: ${feature.problemSolved}` : ""}
${feature.targetAudience ? `\nTarget Audience: ${feature.targetAudience}` : ""}

Normalized Analysis:
${JSON.stringify(normalized, null, 2)}

Target User: ${icp.role}${icp.industry ? ` in ${icp.industry}` : ""}
Goal Metric: ${goalMetric}
Mode: ${mode === "early" ? "Early-stage founder" : "Existing startup"}

${evidenceSection}

${hardConstraints}

Provide:
1. Verdict: BUILD (strong validation), RISKY (saturated/unclear differentiation), or DONT_BUILD (poor fit)
2. Confidence: HIGH, MEDIUM, or LOW (must reflect evidence quality)
3. 3-6 reasons - each MUST reference evidence when available. Include evidenceCitations array with {title, url, snippet, source} for each reason.
4. 2-3 pivot/refine options with smaller MVPs. Include: whoToTarget, whatToBuild, week1Experiment, successMetric, smallestMVP.
5. competitorAnalysis: Array of top 5 competitors found (name, category, whatTheyDo, whyOverlaps, link) - MUST be from evidence only
6. Transparency section:
   - assumptions: What you assumed (include startup context assumptions if provided)
   - limitations: What evidence was missing/limited (mention if startup context incomplete)
   - methodology: How you analyzed (include query samples, competitor extraction method, website evidence usage if available)

REMEMBER: 
- Be evidence-grounded. Never claim "no competitors" if evidence shows otherwise.
- Do NOT invent startup facts. If startup context says "unknown", state that in limitations.
- Each reason should cite specific evidence sources when available.`;
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

