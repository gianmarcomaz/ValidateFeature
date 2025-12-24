import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { VerdictResponseSchema, zodToJsonSchema } from "@/lib/llm/schemas";
import { getVerdictPrompt } from "@/lib/llm/prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, icp, goalMetric, mode, normalized } = body;

    if (!feature || !icp || !goalMetric || !mode || !normalized) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    const verdict = JSON.parse(content);
    
    // Validate with Zod
    const validated = VerdictResponseSchema.parse(verdict);

    return NextResponse.json(validated);
  } catch (error: any) {
    console.error("Error in verdict route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate verdict" },
      { status: 500 }
    );
  }
}

