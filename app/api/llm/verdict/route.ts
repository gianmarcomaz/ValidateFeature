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
    const { feature, icp, goalMetric, mode, normalized, evidence } = body;

    if (!feature || !icp || !goalMetric || !mode || !normalized) {
      return NextResponse.json(
        { error: "Missing required fields", details: "feature, icp, goalMetric, mode, and normalized are required" },
        { status: 400 }
      );
    }

    // Evidence is optional - if missing, verdict still works but with lower confidence
    const evidenceMissing = !evidence;
    const signals = evidence?.signals;

    const prompt = getVerdictPrompt(normalized, feature, icp, goalMetric, mode, evidenceMissing, evidence);

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
5. Every reason must reference evidence when available.
6. competitorAnalysis must include actual competitors found, not hypothetical ones.`,
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
      const validated = VerdictResponseSchema.parse(verdict);
      return NextResponse.json(validated);
    } catch (validationError: any) {
      console.error("Zod validation failed:", validationError);
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

