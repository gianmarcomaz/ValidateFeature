"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface EvidenceMetricsProps {
  evidence?: {
    signals?: {
      competitor_density: number;
      recency_score: number;
      pain_signal: number;
      overall_evidence_score: number;
      evidenceCoverage: number;
      marketEstablished: boolean;
      notes?: string[];
      perMetricEvidence?: {
        competitorDensity: {
          competitors: Array<{ name: string; url: string; snippet: string }>;
        };
        painSignal: {
          indicators: Array<{ title: string; url: string; snippet: string; source: "google" | "hackernews" }>;
        };
        recency: {
          recentHits: Array<{ title: string; url: string; date: string; comments?: number }>;
          summary: string;
        };
        evidenceCoverage: {
          counts: { google: number; hn: number; competitors: number; pricingPages: number };
          sampleCitations: Array<{ title: string; url: string; source: "google" | "hackernews" }>;
        };
      };
    };
    competitorSummary?: {
      totalCompetitorsFound: number;
      topCompetitors: string[];
      saturationSignal: "low" | "medium" | "high";
    };
    competitors?: Array<{
      name: string;
      url: string;
      category: string;
      overlapReason: string;
    }>;
    google?: {
      configured: boolean;
      queries: Array<{ q: string; items: Array<any> }>;
    };
    hackernews?: {
      hits: Array<any>;
    };
    citations?: Array<{
      source: "google" | "hackernews";
      title: string;
      url: string;
      snippet?: string;
      date?: string;
    }>;
    warnings?: Array<{
      type: "missing_config" | "api_error" | "no_results" | "low_coverage";
      message: string;
      details?: string;
    }>;
  };
}

export function EvidenceMetrics({ evidence }: EvidenceMetricsProps) {
  const [showDebug, setShowDebug] = useState(false);
  
  if (!evidence || !evidence.signals) {
    return (
      <Section title="Evidence Metrics">
        <Card>
          <CardContent>
            <p className="text-slate-400 text-sm">No evidence data available</p>
          </CardContent>
        </Card>
      </Section>
    );
  }

  const signals = evidence.signals;
  const summary = evidence.competitorSummary;
  const googleCount = evidence.google?.queries?.reduce((sum, q) => sum + q.items.length, 0) || 0;
  const hnCount = evidence.hackernews?.hits?.length || 0;
  const googleConfigured = evidence.google?.configured ?? false;
  const perMetric = signals.perMetricEvidence;

  return (
    <Section title="Evidence Metrics">
      <Card>
        <CardContent className="space-y-4">
          {/* Warnings Banner */}
          {evidence.warnings && evidence.warnings.length > 0 && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg space-y-2">
              <div className="font-medium text-yellow-200">⚠️ Evidence Collection Warnings</div>
              {evidence.warnings.map((warning, i) => (
                <div key={i} className="text-sm text-yellow-200/90">
                  <div className="font-medium">{warning.message}</div>
                  {warning.details && (
                    <div className="text-yellow-200/70 mt-1">{warning.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Low Coverage Warning */}
          {signals.evidenceCoverage !== undefined && signals.evidenceCoverage < 30 && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
              ⚠️ Low evidence coverage ({Math.round(signals.evidenceCoverage)}/100) - Limited data available
              {!googleConfigured && (
                <div className="mt-2 text-xs text-yellow-200/80">
                  Configure Google CSE API keys to improve evidence quality
                </div>
              )}
            </div>
          )}

          {/* Market Status */}
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Market Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Market Established:</span>
                <span className={signals.marketEstablished ? "text-green-400 font-medium" : "text-slate-300"}>
                  {signals.marketEstablished ? "Yes" : "Unclear"}
                </span>
              </div>
              {summary && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Competitors Found:</span>
                    <span className="text-slate-300">{summary.totalCompetitorsFound}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Saturation:</span>
                    <span className={`font-medium ${
                      summary.saturationSignal === "high" ? "text-red-400" :
                      summary.saturationSignal === "medium" ? "text-yellow-400" :
                      "text-green-400"
                    }`}>
                      {summary.saturationSignal.toUpperCase()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Signals with Inline Evidence */}
          <div className="border-t border-white/10 pt-4 space-y-6">
            <h4 className="font-medium text-slate-200 mb-3">Evidence Signals</h4>
            
            {/* Competitor Density */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Competitor Density</span>
                <span className="text-slate-300">{Math.round(signals.competitor_density)}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${signals.competitor_density}%` }}
                />
              </div>
              {perMetric?.competitorDensity?.competitors && perMetric.competitorDensity.competitors.length > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-fuchsia-500/30 space-y-2">
                  <div className="text-xs text-slate-400 font-medium">Top Competitors:</div>
                  {perMetric.competitorDensity.competitors.map((comp, i) => (
                    <div key={i} className="text-xs">
                      <a
                        href={comp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        {comp.name}
                      </a>
                      {comp.snippet && (
                        <div className="text-slate-400 mt-0.5 line-clamp-2">{comp.snippet}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Pain Signal */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Pain Signal</span>
                <span className="text-slate-300">{Math.round(signals.pain_signal)}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${signals.pain_signal}%` }}
                />
              </div>
              {perMetric?.painSignal?.indicators && perMetric.painSignal.indicators.length > 0 && (
                <div className="mt-2 pl-2 border-l-2 border-fuchsia-500/30 space-y-2">
                  <div className="text-xs text-slate-400 font-medium">Pain Indicators:</div>
                  {perMetric.painSignal.indicators.map((ind, i) => (
                    <div key={i} className="text-xs">
                      <a
                        href={ind.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                      >
                        {ind.title}
                      </a>
                      <div className="text-slate-400 mt-0.5 line-clamp-2">{ind.snippet}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">Source: {ind.source}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recency Score */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Recency Score</span>
                <span className="text-slate-300">{Math.round(signals.recency_score)}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${signals.recency_score}%` }}
                />
              </div>
              {perMetric?.recency && (
                <div className="mt-2 pl-2 border-l-2 border-fuchsia-500/30 space-y-2">
                  <div className="text-xs text-slate-400 font-medium">{perMetric.recency.summary}</div>
                  {perMetric.recency.recentHits && perMetric.recency.recentHits.length > 0 && (
                    <div className="space-y-1.5">
                      {perMetric.recency.recentHits.map((hit, i) => (
                        <div key={i} className="text-xs">
                          <a
                            href={hit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                          >
                            {hit.title}
                          </a>
                          <div className="text-slate-400 text-[10px] mt-0.5">
                            {hit.date} {hit.comments !== undefined && `• ${hit.comments} comments`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Evidence Coverage */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Evidence Coverage</span>
                <span className="text-slate-300">{Math.round(signals.evidenceCoverage)}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${signals.evidenceCoverage}%` }}
                />
              </div>
              {perMetric?.evidenceCoverage && (
                <div className="mt-2 pl-2 border-l-2 border-fuchsia-500/30 space-y-2">
                  <div className="text-xs text-slate-400 font-medium">Data Sources:</div>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <div>Google Results: {perMetric.evidenceCoverage.counts.google}</div>
                    <div>HN Stories: {perMetric.evidenceCoverage.counts.hn}</div>
                    <div>Competitors: {perMetric.evidenceCoverage.counts.competitors}</div>
                    <div>Pricing Pages: {perMetric.evidenceCoverage.counts.pricingPages}</div>
                  </div>
                  {perMetric.evidenceCoverage.sampleCitations && perMetric.evidenceCoverage.sampleCitations.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-slate-400 font-medium">Sample Citations:</div>
                      {perMetric.evidenceCoverage.sampleCitations.map((cite, i) => (
                        <div key={i} className="text-xs">
                          <a
                            href={cite.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                          >
                            {cite.title}
                          </a>
                          <span className="text-slate-500 text-[10px] ml-1">({cite.source})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Overall Evidence Score */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Overall Evidence Score</span>
                <span className="text-slate-300">{Math.round(signals.overall_evidence_score)}/100</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${signals.overall_evidence_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* References Section */}
          {evidence.citations && evidence.citations.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="font-medium text-slate-200 mb-2">References</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {evidence.citations.slice(0, 10).map((cite, i) => (
                  <div key={i} className="text-sm">
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      {cite.title}
                    </a>
                    <span className="text-slate-500 text-xs ml-2">({cite.source})</span>
                    {cite.snippet && (
                      <div className="text-slate-400 text-xs mt-1 line-clamp-2">{cite.snippet}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources Summary */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="font-medium text-slate-200 mb-2">Data Sources</h4>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Google Search Results:</span>
                <span className="text-slate-300">{googleCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Hacker News Stories:</span>
                <span className="text-slate-300">{hnCount}</span>
              </div>
              {!googleConfigured && (
                <p className="text-xs text-yellow-400/80 mt-2">
                  ⚠️ Google CSE not configured - only Hacker News data available. Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX in .env.local
                </p>
              )}
              {googleConfigured && googleCount === 0 && (
                <p className="text-xs text-yellow-400/80 mt-2">
                  ⚠️ Google CSE may be missing/misconfigured or returned 0 results. Check API keys and quota.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {signals.notes && signals.notes.length > 0 && (
            <div className="border-t border-white/10 pt-4">
              <h4 className="font-medium text-slate-200 mb-2">Analysis Notes</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                {signals.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Debug Toggle */}
          {process.env.NEXT_PUBLIC_DEBUG_EVIDENCE === "true" && (
            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-slate-400 hover:text-slate-300"
              >
                {showDebug ? "▼" : "▶"} Debug: Raw Evidence JSON
              </button>
              {showDebug && (
                <pre className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-300 overflow-auto max-h-96">
                  {JSON.stringify(evidence, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Section>
  );
}
