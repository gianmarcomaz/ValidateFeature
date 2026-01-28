"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface TransparencyPanelProps {
  transparency: {
    assumptions: string[];
    limitations: string[];
    methodology: string[];
  };
  evidence?: any;
  startup?: any;
}

export function TransparencyPanel({ transparency, evidence }: TransparencyPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    { key: "methodology", title: "Methodology", items: transparency.methodology },
    { key: "assumptions", title: "Assumptions", items: transparency.assumptions },
    { key: "limitations", title: "Limitations", items: transparency.limitations },
  ];

  return (
    <Section title="Transparency">
      <div className="space-y-2">
        {sections.map((section) => {
          const isExpanded = expandedSection === section.key;
          return (
            <div key={section.key} className="border border-slate-700/50 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedSection(isExpanded ? null : section.key)}
              >
                <span className="font-medium text-slate-200 text-sm">{section.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{section.items.length}</span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {section.items.map((item, index) => (
                    <div key={index} className="p-3 bg-navy-900 rounded-lg">
                      <p className="text-sm text-slate-400">{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Data Sources Summary */}
      {evidence && (
        <div className="mt-6 p-4 bg-navy-900 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Data Sources</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-semibold text-white">
                {evidence.google?.queries?.reduce((sum: number, q: any) => sum + (q.items?.length || 0), 0) || 0}
              </p>
              <p className="text-xs text-slate-500">Google</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {evidence.hackernews?.hits?.length || 0}
              </p>
              <p className="text-xs text-slate-500">HN</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {evidence.competitors?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Competitors</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {evidence.citations?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Citations</p>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
