"use client";

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface Competitor {
  name: string;
  category: string;
  whatTheyDo: string;
  whyOverlaps: string;
  link: string;
}

interface CompetitorsViewProps {
  competitors?: Competitor[];
}

export function CompetitorsView({ competitors }: CompetitorsViewProps) {
  if (!competitors || competitors.length === 0) {
    return null;
  }

  return (
    <Section title="Competitor Analysis">
      <div className="grid md:grid-cols-2 gap-4">
        {competitors.map((competitor, index) => (
          <Card key={index} hover className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-white">{competitor.name}</h4>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
                  {competitor.category}
                </span>
              </div>
              <a
                href={competitor.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:text-teal-light transition-colors text-sm"
              >
                Visit →
              </a>
            </div>

            <p className="text-sm text-slate-400">{competitor.whatTheyDo}</p>

            <div className="pt-2 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">
                <span className="text-slate-400">Overlap:</span> {competitor.whyOverlaps}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
