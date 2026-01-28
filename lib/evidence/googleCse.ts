// Search integration (supports Serper.dev and Google CSE)
import { GoogleCseQueryResult, GoogleCseItem } from "./types";

// Diagnostics from the most recent search request
export type GoogleCseDiagnostics = {
  provider: "serper" | "google_cse" | "none";
  keyPresent: boolean;
  keyPrefix: string | null;
  url: string;
  status?: number;
  bodyPreview?: string;
};

let lastDiagnostics: GoogleCseDiagnostics | null = null;

// Serper.dev types
interface SerperOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
  date?: string;
}

interface SerperApiResponse {
  organic?: SerperOrganicResult[];
}

// Google CSE types
interface GoogleCseApiItem {
  title?: string;
  link?: string;
  snippet?: string;
  displayLink?: string;
  pagemap?: any;
}

interface GoogleCseApiResponse {
  items?: GoogleCseApiItem[];
}

export interface GoogleSearchResult {
  result: GoogleCseQueryResult;
  error?: {
    type: "missing_config" | "rate_limit" | "auth_error" | "api_error";
    message: string;
    statusCode?: number;
  };
}

/**
 * Search using Serper.dev API
 */
async function searchSerper(q: string): Promise<GoogleSearchResult> {
  const apiKey = process.env.SERPER_API_KEY?.trim();
  const keyPrefix = apiKey ? apiKey.slice(0, 6) : null;

  if (!apiKey) {
    return {
      result: { q, items: [] },
      error: {
        type: "missing_config",
        message: "SERPER_API_KEY not configured",
      },
    };
  }

  const endpoint = "https://google.serper.dev/search";

  console.log("[Search] Using Serper.dev with keyPrefix=", keyPrefix);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q,
        num: 10,
      }),
    });

    const rawBody = await response.text();
    const preview = rawBody.substring(0, 400);

    lastDiagnostics = {
      provider: "serper",
      keyPresent: true,
      keyPrefix,
      url: endpoint,
      status: response.status,
      bodyPreview: preview,
    };

    if (!response.ok) {
      if (response.status === 429) {
        return {
          result: { q, items: [] },
          error: { type: "rate_limit", message: "Serper.dev rate limit exceeded", statusCode: 429 },
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          result: { q, items: [] },
          error: { type: "auth_error", message: "Serper.dev authentication failed", statusCode: response.status },
        };
      }
      return {
        result: { q, items: [] },
        error: { type: "api_error", message: `Serper.dev API error: ${response.status}`, statusCode: response.status },
      };
    }

    const data: SerperApiResponse = JSON.parse(rawBody || "{}");
    const items: GoogleCseItem[] = (data.organic || []).map((item) => ({
      title: item.title ?? "",
      snippet: item.snippet ?? "",
      link: item.link ?? "",
      displayLink: item.link ?? "",
      pagemap: item.date ? { metatags: [{ "serper:date": item.date }] } : undefined,
    }));

    return { result: { q, items } };
  } catch (error: any) {
    console.error("[Search] Serper network error:", error?.message || error);
    return {
      result: { q, items: [] },
      error: { type: "api_error", message: `Network error: ${error.message}` },
    };
  }
}

/**
 * Search using Google Custom Search Engine API
 */
async function searchGoogleCseApi(q: string): Promise<GoogleSearchResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY?.trim();
  const cseId = process.env.GOOGLE_CSE_CX?.trim();
  const keyPrefix = apiKey ? apiKey.slice(0, 6) : null;

  if (!apiKey || !cseId) {
    return {
      result: { q, items: [] },
      error: {
        type: "missing_config",
        message: "GOOGLE_CSE_API_KEY or GOOGLE_CSE_CX not configured",
      },
    };
  }

  const endpoint = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(q)}&num=10`;
  const safeUrl = `https://www.googleapis.com/customsearch/v1?key=REDACTED&cx=${cseId}&q=${encodeURIComponent(q)}&num=10`;

  console.log("[Search] Using Google CSE with keyPrefix=", keyPrefix);

  try {
    const response = await fetch(endpoint);
    const rawBody = await response.text();
    const preview = rawBody.substring(0, 400);

    lastDiagnostics = {
      provider: "google_cse",
      keyPresent: true,
      keyPrefix,
      url: safeUrl,
      status: response.status,
      bodyPreview: preview,
    };

    if (!response.ok) {
      if (response.status === 429) {
        return {
          result: { q, items: [] },
          error: { type: "rate_limit", message: "Google CSE rate limit exceeded", statusCode: 429 },
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          result: { q, items: [] },
          error: { type: "auth_error", message: "Google CSE authentication failed", statusCode: response.status },
        };
      }
      return {
        result: { q, items: [] },
        error: { type: "api_error", message: `Google CSE API error: ${response.status}`, statusCode: response.status },
      };
    }

    const data: GoogleCseApiResponse = JSON.parse(rawBody || "{}");
    const items: GoogleCseItem[] = (data.items || []).map((item) => ({
      title: item.title ?? "",
      snippet: item.snippet ?? "",
      link: item.link ?? "",
      displayLink: item.displayLink ?? "",
      pagemap: item.pagemap,
    }));

    return { result: { q, items } };
  } catch (error: any) {
    console.error("[Search] Google CSE network error:", error?.message || error);
    return {
      result: { q, items: [] },
      error: { type: "api_error", message: `Network error: ${error.message}` },
    };
  }
}

/**
 * Primary search function - tries Serper first, falls back to Google CSE
 */
export async function googleSearch(q: string): Promise<GoogleSearchResult> {
  // Check which providers are configured
  const serperKey = process.env.SERPER_API_KEY?.trim();
  const googleKey = process.env.GOOGLE_CSE_API_KEY?.trim();
  const googleCx = process.env.GOOGLE_CSE_CX?.trim();

  // Try Serper first (preferred)
  if (serperKey) {
    const result = await searchSerper(q);
    // If Serper works (or has a non-config error), return it
    if (!result.error || result.error.type !== "missing_config") {
      return result;
    }
  }

  // Fall back to Google CSE
  if (googleKey && googleCx) {
    return await searchGoogleCseApi(q);
  }

  // Neither configured
  lastDiagnostics = {
    provider: "none",
    keyPresent: false,
    keyPrefix: null,
    url: "",
  };

  console.log("[Search] No search provider configured. Set SERPER_API_KEY or GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX");

  return {
    result: { q, items: [] },
    error: {
      type: "missing_config",
      message: "No search provider configured. Set SERPER_API_KEY or GOOGLE_CSE_API_KEY",
    },
  };
}

/**
 * @deprecated Use buildSearchQueries from queryBuilder instead
 */
export function generateSearchQueries(keywords: string[]): string[] {
  const keywordString = keywords.slice(0, 5).join(" ");
  if (!keywordString.trim()) return [];

  return [
    `${keywordString} software`,
    `${keywordString} tool`,
    `${keywordString} alternative`,
    `${keywordString} pricing`,
  ];
}

/**
 * Search with multiple queries
 */
export async function searchGoogleCse(queries: string[]): Promise<{
  results: GoogleCseQueryResult[];
  configured: boolean;
  errors: Array<{ error: { type: string; message: string; statusCode?: number } }>;
}> {
  const results: GoogleCseQueryResult[] = [];
  const errors: Array<{ error: { type: string; message: string; statusCode?: number } }> = [];

  const serperKey = process.env.SERPER_API_KEY?.trim();
  const googleKey = process.env.GOOGLE_CSE_API_KEY?.trim();
  const googleCx = process.env.GOOGLE_CSE_CX?.trim();
  const configured = !!(serperKey || (googleKey && googleCx));

  // Execute searches sequentially to avoid rate limits
  for (const query of queries) {
    const searchResult = await googleSearch(query);
    results.push(searchResult.result);

    if (searchResult.error) {
      errors.push({ error: searchResult.error });
    }

    // Small delay between requests
    if (queries.indexOf(query) < queries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return { results, configured, errors };
}

export function getLastGoogleCseDiagnostics(): GoogleCseDiagnostics | null {
  return lastDiagnostics;
}
