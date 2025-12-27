"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import Link from "next/link";

interface CompetitorAnalysis {
  name: string;
  category: string;
  whatTheyDo: string;
  whyOverlaps: string;
  link: string;
}

interface CompetitorsViewProps {
  competitorAnalysis: CompetitorAnalysis[];
  evidenceCoverage?: number;
}

export function CompetitorsView({ competitorAnalysis, evidenceCoverage }: CompetitorsViewProps) {
  if (!competitorAnalysis || competitorAnalysis.length === 0) {
    return null;
  }

  return (
    <Section title="Competitor Analysis">
      {evidenceCoverage !== undefined && evidenceCoverage < 30 && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
          ⚠️ Low evidence coverage ({Math.round(evidenceCoverage)}/100) - Competitor analysis may be incomplete
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-4">
        {competitorAnalysis.map((competitor, index) => (
          <Card key={index} className="hover:bg-white/10 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{competitor.name}</CardTitle>
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-300">
                    {competitor.category}
                  </span>
                </div>
                {competitor.link && (
                  <Link
                    href={competitor.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    Visit
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-slate-300 font-medium mb-1">What they do:</p>
                <p className="text-sm text-slate-400">{competitor.whatTheyDo}</p>
              </div>
              <div>
                <p className="text-sm text-slate-300 font-medium mb-1">Why it overlaps:</p>
                <p className="text-sm text-slate-400">{competitor.whyOverlaps}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

