import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { NormalizedFeatureSchema } from "@/lib/llm/schemas";
import { getNormalizePrompt } from "@/lib/llm/prompts";
import { zodToJsonSchema } from "@/lib/llm/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, icp, goalMetric, mode } = body;

    if (!feature || !icp || !goalMetric || !mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = getNormalizePrompt(feature, icp, goalMetric, mode);

    // Use structured outputs with JSON schema
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a product validation assistant. Always return valid JSON matching the required schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "normalized_feature",
          schema: zodToJsonSchema(NormalizedFeatureSchema),
          strict: true,
        },
      },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const normalized = JSON.parse(content);
    
    // Validate with Zod
    const validated = NormalizedFeatureSchema.parse(normalized);

    return NextResponse.json(validated);
  } catch (error: any) {
    console.error("Error in normalize route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to normalize feature" },
      { status: 500 }
    );
  }
}

