import { NextRequest, NextResponse } from "next/server";
import { normalizeFeature } from "@/lib/llm/normalize";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feature, icp, goalMetric, mode } = body;

    if (!feature || !icp || !goalMetric || !mode) {
      return NextResponse.json(
        { error: "Missing required fields", details: "feature, icp, goalMetric, and mode are required" },
        { status: 400 }
      );
    }

    if (!feature.title || !feature.description || !icp.role) {
      return NextResponse.json(
        { error: "Invalid input", details: "feature.title, feature.description, and icp.role are required" },
        { status: 400 }
      );
    }

    const normalized = await normalizeFeature({ feature, icp, goalMetric, mode });
    return NextResponse.json(normalized);

  } catch (error: any) {
    console.error("Error in normalize route:", error);

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
      { error: error.message || "Failed to normalize feature", details: "Internal server error" },
      { status: 500 }
    );
  }
}

