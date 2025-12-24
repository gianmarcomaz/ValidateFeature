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
              <CardContent>
                <p>{reason.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

