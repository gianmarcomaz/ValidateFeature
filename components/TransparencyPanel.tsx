"use client";

import { useState } from "react";
import { TransparencyInfo } from "@/lib/domain/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import Link from "next/link";

interface TransparencyPanelProps {
  transparency: TransparencyInfo;
  evidence?: any;
  startup?: any;
}

export function TransparencyPanel({ transparency, evidence, startup }: TransparencyPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Extract sources from evidence
  const googleCitations = evidence?.google?.queries?.flatMap((q: any) => 
    q.items?.slice(0, 5).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: "google" as const,
    })) || []
  ) || [];

  const hnCitations = evidence?.hackernews?.hits?.slice(0, 5).map((hit: any) => ({
    title: hit.title,
    url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
    snippet: hit.title,
    date: hit.created_at,
    source: "hackernews" as const,
  })) || [];

  const websitePages = startup?.websiteEvidence?.pages || [];

  const evidenceCoverage = evidence?.signals?.evidenceCoverage || 0;
  const hasWarnings = evidence?.warnings && evidence.warnings.length > 0;
  const googleConfigured = evidence?.google?.configured !== false;

  return (
    <Section title="Transparency & Methodology">
      <Card>
        <CardContent className="space-y-4">
          {/* Assumptions */}
          <div>
            <button
              onClick={() => toggleSection("assumptions")}
              className="w-full flex items-center justify-between text-left font-medium text-slate-100 py-2"
            >
              <span>Assumptions</span>
              <span className="text-slate-400">{openSection === "assumptions" ? "−" : "+"}</span>
            </button>
            {openSection === "assumptions" && (
              <ul className="mt-2 space-y-2 pl-4 text-sm text-slate-300">
                {transparency.assumptions.map((assumption, index) => (
                  <li key={index} className="list-disc">{assumption}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Limitations */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => toggleSection("limitations")}
              className="w-full flex items-center justify-between text-left font-medium text-slate-100 py-2"
            >
              <span>Limitations</span>
              <span className="text-slate-400">{openSection === "limitations" ? "−" : "+"}</span>
            </button>
            {openSection === "limitations" && (
              <ul className="mt-2 space-y-2 pl-4 text-sm text-slate-300">
                {transparency.limitations.map((limitation, index) => (
                  <li key={index} className="list-disc">{limitation}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Methodology */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => toggleSection("methodology")}
              className="w-full flex items-center justify-between text-left font-medium text-slate-100 py-2"
            >
              <span>Methodology</span>
              <span className="text-slate-400">{openSection === "methodology" ? "−" : "+"}</span>
            </button>
            {openSection === "methodology" && (
              <div className="mt-2 space-y-3">
                <ul className="space-y-2 pl-4 text-sm text-slate-300">
                  {transparency.methodology.map((method, index) => (
                    <li key={index} className="list-disc">{method}</li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm font-medium text-slate-200 mb-2">How metrics are computed:</p>
                  <ul className="space-y-1 pl-4 text-xs text-slate-400">
                    <li className="list-disc">Competitor Density: Based on number of competitors found relative to market size</li>
                    <li className="list-disc">Evidence Coverage: Weighted score of Google results, HN posts, and competitor data</li>
                    <li className="list-disc">Market Established: Determined by competitor count and market signals</li>
                    <li className="list-disc">Pain Signal: Derived from HN discussions and search query patterns</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sources */}
          <div className="border-t border-white/10 pt-4">
            <button
              onClick={() => toggleSection("sources")}
              className="w-full flex items-center justify-between text-left font-medium text-slate-100 py-2"
            >
              <span>Sources</span>
              <span className="text-slate-400">{openSection === "sources" ? "−" : "+"}</span>
            </button>
            {openSection === "sources" && (
              <div className="mt-2 space-y-4">
                {websitePages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-2">Website Evidence:</p>
                    <ul className="space-y-1 pl-4 text-sm text-slate-300">
                      {websitePages.map((page: any, idx: number) => (
                        <li key={idx} className="list-disc">
                          <Link
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            {page.title || page.url}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {googleCitations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-2">Top Google Citations:</p>
                    <ul className="space-y-2 pl-4 text-sm text-slate-300">
                      {googleCitations.slice(0, 5).map((citation: any, idx: number) => (
                        <li key={idx} className="list-disc">
                          <Link
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            {citation.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hnCitations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-200 mb-2">Top Hacker News Citations:</p>
                    <ul className="space-y-2 pl-4 text-sm text-slate-300">
                      {hnCitations.slice(0, 5).map((citation: any, idx: number) => (
                        <li key={idx} className="list-disc">
                          <Link
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            {citation.title}
                          </Link>
                          {citation.date && (
                            <span className="text-slate-500 text-xs ml-2">({new Date(citation.date).getFullYear()})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {googleCitations.length === 0 && hnCitations.length === 0 && websitePages.length === 0 && (
                  <p className="text-sm text-slate-400">No sources available</p>
                )}
              </div>
            )}
          </div>

          {/* Warnings & Coverage */}
          {(evidenceCoverage < 30 || hasWarnings || !googleConfigured) && (
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => toggleSection("warnings")}
                className="w-full flex items-center justify-between text-left font-medium text-slate-100 py-2"
              >
                <span>Warnings & Coverage</span>
                <span className="text-slate-400">{openSection === "warnings" ? "−" : "+"}</span>
              </button>
              {openSection === "warnings" && (
                <div className="mt-2 space-y-2">
                  {evidenceCoverage < 30 && (
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
                      ⚠️ Low evidence coverage ({Math.round(evidenceCoverage)}/100) - Verdict confidence may be reduced
                    </div>
                  )}
                  {!googleConfigured && (
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
                      ⚠️ Google CSE not configured - Only Hacker News data available
                    </div>
                  )}
                  {hasWarnings && evidence?.warnings && (
                    <ul className="space-y-2 pl-4 text-sm text-slate-300">
                      {evidence.warnings.map((warning: any, idx: number) => (
                        <li key={idx} className="list-disc">
                          <span className="font-medium">{warning.message}</span>
                          {warning.details && <span className="text-slate-400">: {warning.details}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}

