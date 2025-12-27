"use client";

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
    };
    competitorSummary?: {
      totalCompetitorsFound: number;
      topCompetitors: string[];
      saturationSignal: "low" | "medium" | "high";
    };
    google?: {
      queries: Array<{ q: string; items: Array<any> }>;
    };
    hackernews?: {
      hits: Array<any>;
    };
  };
}

export function EvidenceMetrics({ evidence }: EvidenceMetricsProps) {
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

  return (
    <Section title="Evidence Metrics">
      <Card>
        <CardContent className="space-y-4">
          {/* Coverage Warning */}
          {signals.evidenceCoverage !== undefined && signals.evidenceCoverage < 30 && (
            <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
              ⚠️ Low evidence coverage ({Math.round(signals.evidenceCoverage)}/100) - Limited data available
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

          {/* Signals */}
          <div className="border-t border-white/10 pt-4">
            <h4 className="font-medium text-slate-200 mb-2">Evidence Signals</h4>
            <div className="space-y-2 text-sm">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Competitor Density</span>
                  <span className="text-slate-300">{Math.round(signals.competitor_density)}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${signals.competitor_density}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Pain Signal</span>
                  <span className="text-slate-300">{Math.round(signals.pain_signal)}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${signals.pain_signal}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Recency Score</span>
                  <span className="text-slate-300">{Math.round(signals.recency_score)}/100</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${signals.recency_score}%` }}
                  />
                </div>
              </div>

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
          </div>

          {/* Data Sources */}
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
              {googleCount === 0 && (
                <p className="text-xs text-yellow-400/80 mt-2">
                  ⚠️ Google CSE not configured - only Hacker News data available
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
        </CardContent>
      </Card>
    </Section>
  );
}

