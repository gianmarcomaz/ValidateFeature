import OpenAI from "openai";
import { NormalizedFeatureSchema, zodToJsonSchema } from "@/lib/llm/schemas";
import { getNormalizePrompt } from "@/lib/llm/prompts";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface NormalizeInput {
    feature: any;
    icp: any;
    goalMetric: string;
    mode: "early" | "existing";
}

export async function normalizeFeature(input: NormalizeInput) {
    const { feature, icp, goalMetric, mode } = input;

    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
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

    let normalized;
    try {
        normalized = JSON.parse(content);
    } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError);
        throw new Error("Invalid response from OpenAI: Failed to parse JSON");
    }

    // Validate with Zod
    try {
        const validated = NormalizedFeatureSchema.parse(normalized);
        return validated;
    } catch (validationError: any) {
        console.error("Zod validation failed:", validationError);
        throw new Error(`Validation failed: ${validationError.message}`);
    }
}
