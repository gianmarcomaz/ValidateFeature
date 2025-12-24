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
    const { feature, icp, goalMetric, mode, normalized } = body;

    if (!feature || !icp || !goalMetric || !mode || !normalized) {
      return NextResponse.json(
        { error: "Missing required fields", details: "feature, icp, goalMetric, mode, and normalized are required" },
        { status: 400 }
      );
    }

    // Create placeholder signals (not implemented yet)
    const signals = {
      trends: { status: "TODO" },
      community: { status: "TODO" },
      competitors: { status: "TODO" },
    };

    const prompt = getVerdictPrompt(normalized, feature, icp, goalMetric, mode, true);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a product validation expert. Always return valid JSON matching the required schema. Be honest about confidence levels when external signals are missing.",
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
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "OpenAI authentication failed", details: "Check your API key" },
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

