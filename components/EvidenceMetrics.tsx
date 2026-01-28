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
    };
    competitorSummary?: {
      totalCompetitorsFound: number;
      topCompetitors: Array<{ name: string; url: string }>;
      saturationSignal: string;
    };
    warnings?: Array<{
      type: string;
      message: string;
      details?: string;
    }>;
  };
}

export function EvidenceMetrics({ evidence }: EvidenceMetricsProps) {
  if (!evidence || !evidence.signals) {
    return null;
  }

  const signals = evidence.signals;

  const metrics = [
    { label: "Competitor Density", value: signals.competitor_density },
    { label: "Recency Score", value: signals.recency_score },
    { label: "Pain Signal", value: signals.pain_signal },
    { label: "Overall Score", value: signals.overall_evidence_score },
  ];

  return (
    <Section title="Evidence Metrics">
      {/* Warnings */}
      {evidence.warnings && evidence.warnings.length > 0 && (
        <div className="mb-4 space-y-2">
          {evidence.warnings.map((warning, index) => (
            <div key={index} className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-300">{warning.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Coverage */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Evidence Coverage</span>
          <span className="text-lg font-semibold text-white">{signals.evidenceCoverage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${signals.evidenceCoverage}%`,
              background: "linear-gradient(90deg, #ff6b4a 0%, #2dd4bf 100%)"
            }}
          />
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className="p-4 bg-navy-900 rounded-xl text-center">
            <p className="text-2xl font-bold text-white mb-1">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Competitor Summary */}
      {evidence.competitorSummary && evidence.competitorSummary.totalCompetitorsFound > 0 && (
        <div className="mt-4 p-4 bg-navy-900 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Competitors Found</span>
            <span className="text-lg font-semibold text-white">{evidence.competitorSummary.totalCompetitorsFound}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {evidence.competitorSummary.topCompetitors.slice(0, 5).map((comp, idx) => (
              <a
                key={idx}
                href={comp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-sm bg-slate-800 rounded-full text-teal hover:bg-slate-700 transition-colors"
              >
                {comp.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
