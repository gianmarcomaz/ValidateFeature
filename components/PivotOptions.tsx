"use client";

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface PivotOption {
  name: string;
  description: string;
  whyStronger: string;
  smallestMVP: string;
}

interface PivotOptionsProps {
  options: PivotOption[];
}

export function PivotOptions({ options }: PivotOptionsProps) {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <Section title="Alternative Approaches">
      <div className="space-y-4">
        {options.map((option, index) => (
          <Card key={index} hover className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">{option.name}</h4>
              <p className="text-sm text-slate-400">{option.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Why Stronger</p>
                <p className="text-sm text-slate-300">{option.whyStronger}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Smallest MVP</p>
                <p className="text-sm text-slate-300">{option.smallestMVP}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
