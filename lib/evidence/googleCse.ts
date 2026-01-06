// Google Custom Search Engine integration
import { GoogleCseQueryResult, GoogleCseItem } from "./types";

interface GoogleCseApiResponse {
  items?: Array<{
    title: string;
    snippet: string;
    link: string;
    displayLink?: string;
  }>;
  error?: {
    code: number;
    message: string;
  };
}

export interface GoogleSearchResult {
  result: GoogleCseQueryResult;
  error?: {
    type: "missing_config" | "rate_limit" | "auth_error" | "api_error";
    message: string;
    statusCode?: number;
  };
}

export async function googleSearch(q: string): Promise<GoogleSearchResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!apiKey || !cx) {
    // Return empty result with error info
    return {
      result: { q, items: [] },
      error: {
        type: "missing_config",
        message: "Google CSE API keys not configured",
      },
    };
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", q);
  url.searchParams.set("num", "10"); // Max 10 results per query

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle rate limiting
      if (response.status === 429) {
        return {
          result: { q, items: [] },
          error: {
            type: "rate_limit",
            message: `Rate limit exceeded for query: ${q}`,
            statusCode: 429,
          },
        };
      }

      if (response.status === 403) {
        return {
          result: { q, items: [] },
          error: {
            type: "auth_error",
            message: "Google CSE API key invalid or quota exceeded",
            statusCode: 403,
          },
        };
      }

      return {
        result: { q, items: [] },
        error: {
          type: "api_error",
          message: `Google CSE API error: ${response.status}`,
          statusCode: response.status,
        },
      };
    }

    const data: GoogleCseApiResponse = await response.json();

    if (data.error) {
      return {
        result: { q, items: [] },
        error: {
          type: "api_error",
          message: data.error.message || "Unknown Google CSE API error",
          statusCode: data.error.code,
        },
      };
    }

    const items: GoogleCseItem[] = (data.items || []).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
    }));

    return { result: { q, items } };
  } catch (error: any) {
    return {
      result: { q, items: [] },
      error: {
        type: "api_error",
        message: `Network error: ${error.message}`,
      },
    };
  }
}

/**
 * Search Google CSE with multiple queries
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
 * Search Google CSE with multiple queries
 */
export async function searchGoogleCse(queries: string[]): Promise<GoogleCseQueryResult[]> {
  const results: GoogleCseQueryResult[] = [];

  // Execute searches sequentially to avoid rate limits
  for (const query of queries) {
    const result = await googleSearch(query);
    results.push(result);
    
    // Small delay between requests to be respectful
    if (queries.indexOf(query) < queries.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

