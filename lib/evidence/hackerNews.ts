// Hacker News API integration (via Algolia)
import { HackerNewsHit } from "./types";

interface AlgoliaResponse {
  hits: Array<{
    title: string;
    url?: string;
    points?: number;
    num_comments?: number;
    created_at?: string;
    created_at_i?: number;
    objectID: string;
  }>;
  nbHits: number;
}

/**
 * Search Hacker News via Algolia API
 */
export async function searchHackerNews(keywords: string[]): Promise<HackerNewsHit[]> {
  const keywordString = keywords.slice(0, 5).join(" ");

  if (!keywordString.trim()) {
    return [];
  }

  const url = new URL("https://hn.algolia.com/api/v1/search");
  url.searchParams.set("query", keywordString);
  url.searchParams.set("tags", "story");
  url.searchParams.set("hitsPerPage", "10");

  try {
    console.log(`[HN] Fetching: ${url.toString()}`);
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url.toString(), {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[HN] API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text().catch(() => "");
      console.error(`[HN] Error response: ${errorText.substring(0, 200)}`);
      return [];
    }

    const data: AlgoliaResponse = await response.json();
    console.log(`[HN] Received ${data.nbHits} total hits, returning ${data.hits?.length || 0} hits`);

    const hits: HackerNewsHit[] = (data.hits || []).map((hit) => ({
      title: hit.title,
      url: hit.url,
      points: hit.points || 0,
      num_comments: hit.num_comments || 0,
      created_at: hit.created_at,
      objectID: hit.objectID,
    }));

    return hits;
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.error(`[HN] Request timeout for "${keywordString}"`);
    } else {
      console.error(`[HN] Error fetching Hacker News for "${keywordString}":`, error?.message || error);
    }
    return [];
  }
}

