import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const IngestRequestSchema = z.object({
  url: z.string().url(),
});

// SSRF protection: validate URL is safe
function isSafeUrl(urlString: string): { safe: boolean; reason?: string } {
  try {
    const url = new URL(urlString);
    const protocol = url.protocol.toLowerCase();
    const hostname = url.hostname.toLowerCase();

    // Only allow http/https
    if (protocol !== "http:" && protocol !== "https:") {
      return { safe: false, reason: "Only http and https protocols are allowed" };
    }

    // Block localhost and private IP ranges
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("172.17.") ||
      hostname.startsWith("172.18.") ||
      hostname.startsWith("172.19.") ||
      hostname.startsWith("172.20.") ||
      hostname.startsWith("172.21.") ||
      hostname.startsWith("172.22.") ||
      hostname.startsWith("172.23.") ||
      hostname.startsWith("172.24.") ||
      hostname.startsWith("172.25.") ||
      hostname.startsWith("172.26.") ||
      hostname.startsWith("172.27.") ||
      hostname.startsWith("172.28.") ||
      hostname.startsWith("172.29.") ||
      hostname.startsWith("172.30.") ||
      hostname.startsWith("172.31.") ||
      hostname === "[::1]" ||
      hostname.startsWith("169.254.") // Link-local
    ) {
      return { safe: false, reason: "Localhost and private IP ranges are not allowed" };
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: "Invalid URL format" };
  }
}

// Simple HTML to text extraction
function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

// Fetch a single page with timeout and size limit
async function fetchPage(url: string, timeoutMs: number = 10000, maxSizeBytes: number = 500000): Promise<{ content: string; title?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ValidateBot/1.0)",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error("Not HTML content");
    }

    // Read with size limit
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    let content = "";
    let totalBytes = 0;
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.length;
      if (totalBytes > maxSizeBytes) {
        reader.cancel();
        throw new Error("Response too large");
      }

      content += decoder.decode(value, { stream: true });
    }

    // Extract title
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    const text = htmlToText(content);
    const snippet = text.substring(0, 1200).trim();

    return { content: snippet, title };
  } catch (error: any) {
    clearTimeout(timeout);
    throw error;
  }
}

// Get common page paths to try
function getCommonPaths(baseUrl: string): string[] {
  const paths = ["/", "/about", "/pricing", "/product", "/customers", "/docs"];
  return paths.map((path) => {
    try {
      const url = new URL(path, baseUrl);
      return url.toString();
    } catch {
      return null;
    }
  }).filter((url): url is string => url !== null);
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validated = IngestRequestSchema.parse(body);
    const { url } = validated;

    // SSRF protection
    const safetyCheck = isSafeUrl(url);
    if (!safetyCheck.safe) {
      return NextResponse.json(
        { error: "Invalid URL", details: safetyCheck.reason },
        { status: 400 }
      );
    }

    const warnings: string[] = [];
    const pages: Array<{ url: string; title?: string; snippet: string }> = [];

    // Fetch homepage
    try {
      const homepage = await fetchPage(url);
      pages.push({
        url,
        title: homepage.title,
        snippet: homepage.content,
      });
    } catch (error: any) {
      warnings.push(`Failed to fetch homepage: ${error.message}`);
    }

    // Try common pages (limit to 4 additional)
    const commonPaths = getCommonPaths(url);
    let fetchedCount = 0;
    for (const pageUrl of commonPaths.slice(0, 4)) {
      if (pageUrl === url) continue; // Skip if homepage
      if (fetchedCount >= 4) break;

      try {
        const page = await fetchPage(pageUrl);
        pages.push({
          url: pageUrl,
          title: page.title,
          snippet: page.content,
        });
        fetchedCount++;
      } catch (error: any) {
        // Silently skip failed pages
      }
    }

    if (pages.length === 0) {
      return NextResponse.json(
        {
          startup: null,
          warnings: ["Could not fetch any pages from the website"],
        },
        { status: 200 }
      );
    }

    // Combine all page snippets for LLM extraction
    const combinedText = pages
      .map((p) => `[Page: ${p.url}${p.title ? ` - ${p.title}` : ""}]\n${p.snippet}`)
      .join("\n\n---\n\n");

    // Extract startup context using LLM
    const extractionPrompt = `Extract structured startup information from the following website content. Return ONLY valid JSON matching the schema.

Website Content:
${combinedText.substring(0, 8000)}${combinedText.length > 8000 ? "\n[... truncated]" : ""}

Extract the following fields:
- name: Company/product name
- description: Brief description (1-2 sentences)
- whatItDoes: What the product/service does (2-3 sentences)
- problemSolved: What problem it solves (1-2 sentences)
- targetAudience: Who the target audience is (1 sentence)
- businessModel: How they make money (optional, 1 sentence if available)
- differentiators: Array of 2-4 key differentiators (optional)

If information is not available, use "unknown" for that field. Do NOT invent facts.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a data extraction assistant. Extract only facts present in the provided content. Return valid JSON only.",
        },
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "startup_extraction",
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              whatItDoes: { type: "string" },
              problemSolved: { type: "string" },
              targetAudience: { type: "string" },
              businessModel: { type: "string" },
              differentiators: { type: "array", items: { type: "string" } },
            },
            required: ["name", "description", "whatItDoes", "problemSolved", "targetAudience"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch (parseError) {
      warnings.push("Failed to parse extraction response");
      extracted = {
        name: "unknown",
        description: "unknown",
        whatItDoes: "unknown",
        problemSolved: "unknown",
        targetAudience: "unknown",
      };
    }

    // Build startup context
    const startup = {
      source: "website" as const,
      websiteUrl: url,
      name: extracted.name || "unknown",
      description: extracted.description || "unknown",
      whatItDoes: extracted.whatItDoes || "unknown",
      problemSolved: extracted.problemSolved || "unknown",
      targetAudience: extracted.targetAudience || "unknown",
      businessModel: extracted.businessModel || undefined,
      differentiators: extracted.differentiators?.filter((d: string) => d && d !== "unknown") || undefined,
      websiteEvidence: {
        fetchedAt: Date.now(),
        pages,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
    };

    return NextResponse.json({ startup, warnings });
  } catch (error: any) {
    console.error("Error in startup/ingest route:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to ingest website", warnings: [] },
      { status: 500 }
    );
  }
}

