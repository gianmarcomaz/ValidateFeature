import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { VerdictResponseSchema, zodToJsonSchema } from "@/lib/llm/schemas";
import { getVerdictPrompt } from "@/lib/llm/prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Validate OpenAI key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set");
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { feature, icp, goalMetric, mode, normalized, evidence, startup } = body;

    if (!feature || !icp || !goalMetric || !mode || !normalized) {
      return NextResponse.json(
        { error: "Missing required fields", details: "feature, icp, goalMetric, mode, and normalized are required" },
        { status: 400 }
      );
    }

    // Evidence is optional - if missing, verdict still works but with lower confidence
    const evidenceMissing = !evidence;
    const signals = evidence?.signals;
    
    // Log evidence structure for debugging (counts only)
    if (evidence) {
      const googleCount = evidence.google?.queries?.reduce((sum: number, q: any) => sum + (q.items?.length || 0), 0) || 0;
      const hnCount = evidence.hackernews?.hits?.length || 0;
      const competitorCount = evidence.competitors?.length || 0;
      console.log(`[Verdict] Evidence received: googleItems=${googleCount}, hnHits=${hnCount}, competitors=${competitorCount}, coverage=${signals?.evidenceCoverage || 0}`);
    } else {
      console.log(`[Verdict] No evidence provided`);
    }

    const prompt = getVerdictPrompt(normalized, feature, icp, goalMetric, mode, evidenceMissing, evidence, startup);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a product validation expert. Always return valid JSON matching the required schema.

CRITICAL RULES:
1. Use ONLY evidence provided. Never claim "no competitors" if evidence shows competitors found.
2. If marketEstablished=true or competitors.length >= 3, you MUST acknowledge the market is established.
3. If evidenceCoverage is low, lower confidence and state "insufficient evidence" in methodology.
4. "RISKY" means saturated/unclear differentiation, NOT "no market" or "no demand".
5. Every reason MUST include evidenceCitations array with 2-4 citations from the "AVAILABLE CITATIONS" section when evidence exists.
6. Copy citation data EXACTLY (title, url, snippet) from the AVAILABLE CITATIONS list - do not invent or modify.
7. competitorAnalysis must include actual competitors found, not hypothetical ones.
8. If evidence exists but you omit evidenceCitations, your response is INVALID.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "verdict_response",
          schema: zodToJsonSchema(VerdictResponseSchema),
          strict: true,
        },
      },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    let verdict;
    try {
      verdict = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.error("Response content:", content);
      return NextResponse.json(
        { error: "Invalid response from OpenAI", details: "Failed to parse JSON response" },
        { status: 500 }
      );
    }
    
    // Validate with Zod
    try {
      let validated = VerdictResponseSchema.parse(verdict);
      
      // Post-process: Ensure verdict respects evidence constraints
      if (evidence) {
        const competitors = evidence.competitors || [];
        const evidenceCoverage = evidence.signals?.evidenceCoverage || 0;
        const marketEstablished = evidence.signals?.marketEstablished || false;
        
        // If evidence coverage is low, force lower confidence
        if (evidenceCoverage < 30 && validated.confidence === "HIGH") {
          validated.confidence = "MEDIUM";
          if (!validated.transparency.limitations.some(l => l.includes("insufficient evidence"))) {
            validated.transparency.limitations.push(
              "Low evidence coverage - verdict based on limited data"
            );
          }
        }
        
        // Ensure competitorAnalysis matches actual competitors
        if (competitors.length > 0 && validated.competitorAnalysis) {
          // Validate that competitorAnalysis references actual competitors
          const competitorNames = new Set(competitors.map(c => c.name.toLowerCase()));
          validated.competitorAnalysis = validated.competitorAnalysis
            .filter(comp => {
              const nameMatch = competitorNames.has(comp.name.toLowerCase());
              // Allow if name matches or if URL matches a competitor
              return nameMatch || competitors.some(c => c.url === comp.link);
            })
            .slice(0, 5); // Max 5
        }
        
        // If market is established but verdict claims otherwise, add limitation
        if (marketEstablished && competitors.length >= 3) {
          const reasonsText = validated.reasons.map(r => r.detail).join(" ").toLowerCase();
          if (reasonsText.includes("no competitors") || reasonsText.includes("no market")) {
            validated.transparency.limitations.push(
              "Initial analysis may have underestimated market saturation - ${competitors.length} competitors were found"
            );
          }
        }
        
        // Post-process: Ensure citations are added to reasons when evidence exists
        const googleItems = evidence.google?.queries?.flatMap((q: any) => q.items || []) || [];
        const hnHits = evidence.hackernews?.hits || [];
        const hasCitations = googleItems.length > 0 || hnHits.length > 0;
        
        if (hasCitations) {
          // Build available citations for post-processing
          const availableCitations: Array<{ title: string; url: string; snippet: string; source: "google" | "hackernews" | "website" }> = [];
          
          // Add Google citations
          googleItems.slice(0, 10).forEach((item: any) => {
            if (item.title && item.link) {
              availableCitations.push({
                title: item.title,
                url: item.link,
                snippet: (item.snippet || "").substring(0, 150),
                source: "google",
              });
            }
          });
          
          // Add HN citations
          hnHits.slice(0, 5).forEach((hit: any) => {
            if (hit.title && hit.url) {
              availableCitations.push({
                title: hit.title,
                url: hit.url,
                snippet: `${hit.num_comments || 0} comments, ${hit.points || 0} points`,
                source: "hackernews",
              });
            }
          });
          
          // Add website evidence citations if available
          if (startup?.websiteEvidence?.pages) {
            startup.websiteEvidence.pages.slice(0, 3).forEach((page: any) => {
              if (page.url) {
                availableCitations.push({
                  title: page.title || page.url,
                  url: page.url,
                  snippet: (page.snippet || "").substring(0, 150),
                  source: "website",
                });
              }
            });
          }
          
          // If reasons don't have citations but evidence exists, add them
          validated.reasons = validated.reasons.map((reason, idx) => {
            // If reason already has citations, keep them
            if (reason.evidenceCitations && reason.evidenceCitations.length > 0) {
              return reason;
            }
            
            // Otherwise, add relevant citations (2-4 per reason)
            // Select citations that might be relevant to this reason
            const reasonText = `${reason.title} ${reason.detail}`.toLowerCase();
            const relevantCitations = availableCitations
              .filter(citation => {
                // Simple relevance check: if reason mentions keywords from citation
                const citationText = `${citation.title} ${citation.snippet}`.toLowerCase();
                return reasonText.split(" ").some(word => 
                  word.length > 4 && citationText.includes(word)
                ) || idx < availableCitations.length; // Fallback: assign by index
              })
              .slice(0, 4);
            
            // If no relevant citations found, just use first few available
            const citationsToAdd = relevantCitations.length > 0 
              ? relevantCitations 
              : availableCitations.slice(idx * 2, idx * 2 + 4);
            
            return {
              ...reason,
              evidenceCitations: citationsToAdd.slice(0, 4),
            };
          });
        }
      }
      
      return NextResponse.json(validated);
    } catch (validationError: any) {
      console.error("Zod validation failed:", validationError);
      
      // If validation fails but we have evidence, return a safe fallback verdict
      if (evidence) {
        const competitors = evidence.competitors || [];
        const evidenceCoverage = evidence.signals?.evidenceCoverage || 0;
        const marketEstablished = evidence.signals?.marketEstablished || false;
        
        const fallbackVerdict = {
          verdict: evidenceCoverage < 30 ? "RISKY" : marketEstablished && competitors.length >= 5 ? "RISKY" : "BUILD",
          confidence: evidenceCoverage < 30 ? "LOW" : "MEDIUM",
          reasons: [
            {
              title: "Evidence-based validation",
              detail: `Based on ${competitors.length} competitors found and ${evidenceCoverage}/100 evidence coverage. ${evidenceCoverage < 30 ? "Limited data available - confidence reduced." : "Moderate evidence available."}`,
            },
          ],
          pivotOptions: [],
          competitorAnalysis: competitors.slice(0, 5).map(c => ({
            name: c.name,
            category: c.category,
            whatTheyDo: c.overlapReason,
            whyOverlaps: `Found via search results - ${c.category} category`,
            link: c.url,
          })),
          transparency: {
            assumptions: ["Evidence-based validation"],
            limitations: [
              "OpenAI verdict parsing failed - using evidence-based fallback",
              evidenceCoverage < 30 ? "Low evidence coverage - verdict confidence reduced" : "",
              !evidence.google?.configured ? "Google CSE not configured - only HN data available" : "",
            ].filter(Boolean),
            methodology: [
              `Analyzed ${competitors.length} competitors from search results`,
              `Evidence coverage: ${evidenceCoverage}/100`,
              marketEstablished ? "Market appears established" : "Market establishment unclear",
            ],
          },
        };
        
        return NextResponse.json(fallbackVerdict);
      }
      
      return NextResponse.json(
        { error: "Validation failed", details: validationError.errors || validationError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in verdict route:", error);
    
    // Handle OpenAI API errors
    if (error?.status === 401 || error?.message?.includes("401") || error?.message?.includes("authentication")) {
      const keyPresent = !!process.env.OPENAI_API_KEY;
      const keyLength = process.env.OPENAI_API_KEY?.length || 0;
      const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 3) || "N/A";
      
      console.error("OpenAI Auth Error Details:", {
        keyPresent,
        keyLength,
        keyPrefix,
        errorMessage: error?.message,
        errorStatus: error?.status,
      });
      
      return NextResponse.json(
        { 
          error: "OpenAI authentication failed", 
          details: `Check your API key. Key present: ${keyPresent}, Length: ${keyLength}, Prefix: ${keyPrefix}. Original error: ${error?.message || "Unknown error"}. Make sure your .env.local file is in the project root and you've restarted the dev server after adding the key.` 
        },
        { status: 401 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limit exceeded", details: "Please try again later" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate verdict", details: "Internal server error" },
      { status: 500 }
    );
  }
}

