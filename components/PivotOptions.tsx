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
                <p className="text-sm font-medium text-gray-600 mb-1">Description:</p>
                <p className="text-sm">{option.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Why Stronger:</p>
                <p className="text-sm">{option.whyStronger}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Smallest MVP:</p>
                <p className="text-sm text-blue-600">{option.smallestMVP}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}

