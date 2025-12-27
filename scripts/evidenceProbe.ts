#!/usr/bin/env tsx
/**
 * CLI script to test evidence gathering
 * Usage: npm run evidence:probe "FEATURE IDEA TEXT"
 */

import { deriveKeywords } from "../lib/evidence/keywords";
import { googleSearch } from "../lib/evidence/googleCse";
import { searchHackerNews } from "../lib/evidence/hackerNews";
import { normalizeEvidence, generateCompetitorSummary } from "../lib/evidence/normalize";
import { computeSignals } from "../lib/evidence/signals";
import { buildSearchQueries } from "../lib/evidence/queryBuilder";
import { extractCompetitorsFromGoogle } from "../lib/evidence/competitors";

async function main() {
  const query = process.argv[2];

  if (!query) {
    console.error("Usage: npm run evidence:probe \"FEATURE IDEA TEXT\"");
    process.exit(1);
  }

  console.log("\n🔍 Evidence Probe\n");
  console.log(`Query: "${query}"\n`);

  // Derive keywords
  const keywords = deriveKeywords(query);
  console.log(`Derived Keywords: ${keywords.join(", ")}\n`);

  try {
    // Build strategic search queries
    const searchQueries = buildSearchQueries({ query, keywords });
    console.log(`🔍 Search Queries (${searchQueries.length}):`);
    searchQueries.forEach((q, i) => console.log(`   ${i + 1}. ${q}`));
    console.log();

    // Fetch evidence
    console.log("Fetching evidence from Google CSE and Hacker News...\n");
    
    // Execute Google searches sequentially
    const googleResults = [];
    for (const q of searchQueries) {
      const result = await googleSearch(q);
      googleResults.push(result);
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    const hnResults = await searchHackerNews(keywords);

    const totalGoogleResults = googleResults.reduce((sum, q) => sum + q.items.length, 0);
    console.log(`✅ Google CSE: ${totalGoogleResults} results across ${googleResults.length} queries`);
    console.log(`✅ Hacker News: ${hnResults.length} stories\n`);

    // Extract competitors
    const competitors = extractCompetitorsFromGoogle(googleResults);
    const competitorSummary = generateCompetitorSummary(competitors);
    
    console.log(`🎯 Competitors Found: ${competitors.length}`);
    competitors.slice(0, 8).forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.category}) - ${c.confidence} confidence`);
      console.log(`      ${c.domain}`);
    });
    console.log();

    // Normalize
    const normalized = normalizeEvidence(googleResults, hnResults, competitors);

    // Add competitors and summary
    const evidenceWithCompetitors = {
      ...normalized,
      competitors,
      competitorSummary,
    };

    // Compute signals
    const signals = computeSignals(evidenceWithCompetitors);

    // Output results
    console.log("📊 Signals:");
    console.log(JSON.stringify(signals, null, 2));
    console.log("\n📚 Top Citations:");
    normalized.citations.slice(0, 8).forEach((citation, i) => {
      console.log(`${i + 1}. [${citation.source.toUpperCase()}] ${citation.title}`);
      console.log(`   ${citation.url}`);
    });

    // Write to file
    const fs = await import("fs/promises");
    const path = await import("path");
    const outputPath = path.join(process.cwd(), "evidence.sample.json");
    
    const fullEvidence = {
      ...evidenceWithCompetitors,
      signals,
    };

    await fs.writeFile(outputPath, JSON.stringify(fullEvidence, null, 2));
    console.log(`\n✅ Full evidence saved to: ${outputPath}\n`);

  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.message.includes("GOOGLE_CSE")) {
      console.error("\n⚠️  Make sure GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX are set in .env.local");
    }
    process.exit(1);
  }
}

main();

