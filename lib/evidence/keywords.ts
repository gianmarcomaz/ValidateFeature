// Keyword derivation from query text (deterministic, no LLM)

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
  "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
  "to", "was", "will", "with", "the", "this", "but", "they", "have",
  "had", "what", "said", "each", "which", "their", "time", "if",
  "up", "out", "many", "then", "them", "these", "so", "some", "her",
  "would", "make", "like", "into", "him", "has", "two", "more",
  "very", "after", "words", "long", "than", "first", "been", "call",
  "who", "oil", "sit", "now", "find", "down", "day", "did", "get",
  "come", "made", "may", "part"
]);

/**
 * Derive keywords from query text (deterministic)
 */
export function deriveKeywords(query: string, maxKeywords: number = 8): string[] {
  // Normalize: lowercase, remove punctuation, split
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2); // Remove very short words

  // Remove stopwords and duplicates
  const keywords = Array.from(
    new Set(words.filter(word => !STOPWORDS.has(word)))
  );

  // Take top keywords (prioritize longer words)
  const sorted = keywords.sort((a, b) => {
    // Prefer longer words
    if (b.length !== a.length) return b.length - a.length;
    return a.localeCompare(b);
  });

  return sorted.slice(0, maxKeywords);
}

