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

export async function googleSearch(q: string): Promise<GoogleCseQueryResult> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;

  if (!apiKey || !cx) {
    // Return empty result instead of throwing - allows Hacker News to still work
    console.warn("Google CSE not configured: GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX must be set in environment variables");
    return { q, items: [] };
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
        console.warn(`Google CSE rate limit hit for query: ${q}`);
        return { q, items: [] };
      }

      if (response.status === 403) {
        console.error("Google CSE API key invalid or quota exceeded");
        throw new Error("Google CSE authentication failed or quota exceeded");
      }

      throw new Error(`Google CSE API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data: GoogleCseApiResponse = await response.json();

    if (data.error) {
      console.error("Google CSE API error:", data.error);
      return { q, items: [] };
    }

    const items: GoogleCseItem[] = (data.items || []).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      displayLink: item.displayLink,
    }));

    return { q, items };
  } catch (error: any) {
    console.error(`Error fetching Google CSE for query "${q}":`, error);
    // Return empty result instead of throwing to allow partial results
    return { q, items: [] };
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

