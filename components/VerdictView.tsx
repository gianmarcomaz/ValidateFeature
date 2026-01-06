"use client";

import { VerdictResponse } from "@/lib/domain/types";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface VerdictViewProps {
  verdict: VerdictResponse;
}

export function VerdictView({ verdict }: VerdictViewProps) {
  return (
    <div className="space-y-6">
      {/* Verdict Badge */}
      <div className="flex items-center justify-center py-4">
        <Badge verdict={verdict.verdict} confidence={verdict.confidence} size="lg" />
      </div>

      {/* Reasons */}
      <Section title="Reasons">
        <div className="space-y-4">
          {verdict.reasons.map((reason, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{reason.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p>{reason.detail}</p>
                {reason.evidenceCitations && reason.evidenceCitations.length > 0 ? (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm font-medium text-slate-200 mb-2">Evidence used:</p>
                    <div className="space-y-2">
                      {reason.evidenceCitations.slice(0, 4).map((citation, citIndex) => (
                        <div key={citIndex} className="text-sm">
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline flex items-start gap-2"
                          >
                            <span className="flex-1">
                              <span className="font-medium">{citation.title}</span>
                              {citation.snippet && (
                                <span className="text-slate-400 block mt-1 text-xs">
                                  {citation.snippet.substring(0, 150)}...
                                </span>
                              )}
                            </span>
                            <span className="text-xs px-2 py-1 bg-white/10 rounded text-slate-300">
                              {citation.source}
                            </span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-yellow-300">⚠️ No evidence citations available for this reason</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

