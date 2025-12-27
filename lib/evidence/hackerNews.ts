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
    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`Hacker News API error: ${response.status}`);
      return [];
    }

    const data: AlgoliaResponse = await response.json();

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
    console.error(`Error fetching Hacker News for "${keywordString}":`, error);
    return [];
  }
}

