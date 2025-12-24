import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ValidationSprintSchema, zodToJsonSchema } from "@/lib/llm/schemas";
import { getSprintPrompt } from "@/lib/llm/prompts";
import { VerdictResponse } from "@/lib/llm/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { verdict, normalized, feature } = body;

    if (!verdict || !normalized || !feature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = getSprintPrompt(verdict as VerdictResponse, normalized, feature);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a validation sprint planning expert. Always return valid JSON matching the required schema. Create actionable, fast-to-run validation tests.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "validation_sprint",
          schema: zodToJsonSchema(ValidationSprintSchema),
          strict: true,
        },
      },
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const sprint = JSON.parse(content);
    
    // Validate with Zod
    const validated = ValidationSprintSchema.parse(sprint);

    return NextResponse.json(validated);
  } catch (error: any) {
    console.error("Error in sprint route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate sprint plan" },
      { status: 500 }
    );
  }
}

