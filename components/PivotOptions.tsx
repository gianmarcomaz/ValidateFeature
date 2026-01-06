"use client";

import { PivotOption } from "@/lib/domain/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface PivotOptionsProps {
  options: PivotOption[];
}

export function PivotOptions({ options }: PivotOptionsProps) {
  return (
    <Section title="Refine & Pivot Options">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option, index) => (
          <Card key={index} hover>
            <CardHeader>
              <CardTitle>{option.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-200 mb-1">Description:</p>
                <p className="text-sm text-slate-300">{option.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 mb-1">Why Stronger:</p>
                <p className="text-sm text-slate-300">{option.whyStronger}</p>
              </div>
              {option.whoToTarget && (
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">Who to Target:</p>
                  <p className="text-sm text-slate-300">{option.whoToTarget}</p>
                </div>
              )}
              {option.whatToBuild && (
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">What to Build/Change:</p>
                  <p className="text-sm text-slate-300">{option.whatToBuild}</p>
                </div>
              )}
              {option.week1Experiment && (
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">Week-1 Experiment:</p>
                  <p className="text-sm text-slate-300">{option.week1Experiment}</p>
                </div>
              )}
              {option.successMetric && (
                <div>
                  <p className="text-sm font-medium text-slate-200 mb-1">Success Metric:</p>
                  <p className="text-sm text-slate-300">{option.successMetric}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-200 mb-1">Smallest MVP:</p>
                <p className="text-sm text-cyan-400">{option.smallestMVP}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

