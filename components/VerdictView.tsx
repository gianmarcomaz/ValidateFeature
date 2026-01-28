"use client";

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { VerdictBadge, ConfidenceBadge } from "@/components/ui/Badge";

interface VerdictReason {
  title: string;
  detail: string;
  evidenceCitations?: Array<{
    title: string;
    url: string;
    snippet?: string;
    source: "google" | "hackernews" | "website";
  }>;
}

interface VerdictViewProps {
  verdict: "BUILD" | "RISKY" | "DONT_BUILD";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  reasons: VerdictReason[];
}

export function VerdictView({ verdict, confidence, reasons }: VerdictViewProps) {
  return (
    <Section>
      {/* Verdict Header */}
      <div className="text-center mb-8">
        <VerdictBadge verdict={verdict} className="mb-3" />
        <div className="flex justify-center">
          <ConfidenceBadge confidence={confidence} />
        </div>
      </div>

      {/* Reasons */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Key Reasons</h3>
        {reasons.map((reason, index) => (
          <Card key={index} className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{reason.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{reason.detail}</p>

                {/* Evidence Citations */}
                {reason.evidenceCitations && reason.evidenceCitations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2">Sources:</p>
                    <div className="space-y-2">
                      {reason.evidenceCitations.slice(0, 3).map((citation, cidx) => (
                        <a
                          key={cidx}
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-teal hover:text-teal-light transition-colors"
                        >
                          {citation.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
