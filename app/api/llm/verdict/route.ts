import { NextRequest, NextResponse } from "next/server";
import { generateVerdict } from "@/lib/llm/verdict";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, icp, goalMetric, mode, normalized, evidence, startup } = body;

    if (!feature || !icp || !goalMetric || !mode || !normalized) {
      return NextResponse.json(
        { error: "Missing required fields", details: "feature, icp, goalMetric, mode, and normalized are required" },
        { status: 400 }
      );
    }

    const verdict = await generateVerdict({ feature, icp, goalMetric, mode, normalized, evidence, startup });
    return NextResponse.json(verdict);

  } catch (error: any) {
    console.error("Error in verdict route:", error);

    // Handle OpenAI API errors
    if (error?.status === 401 || error?.message?.includes("401") || error?.message?.includes("authentication")) {
      return NextResponse.json(
        { error: "OpenAI authentication failed", details: error.message },
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

