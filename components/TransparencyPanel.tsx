"use client";

import { useState } from "react";
import { TransparencyInfo } from "@/lib/domain/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface TransparencyPanelProps {
  transparency: TransparencyInfo;
}

export function TransparencyPanel({ transparency }: TransparencyPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <Section title="Transparency & Methodology">
      <Card>
        <CardContent className="space-y-4">
          {/* Assumptions */}
          <div>
            <button
              onClick={() => toggleSection("assumptions")}
              className="w-full flex items-center justify-between text-left font-medium text-gray-900 py-2"
            >
              <span>Assumptions</span>
              <span className="text-gray-500">{openSection === "assumptions" ? "−" : "+"}</span>
            </button>
            {openSection === "assumptions" && (
              <ul className="mt-2 space-y-2 pl-4 text-sm text-gray-700">
                {transparency.assumptions.map((assumption, index) => (
                  <li key={index} className="list-disc">{assumption}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Limitations */}
          <div className="border-t pt-4">
            <button
              onClick={() => toggleSection("limitations")}
              className="w-full flex items-center justify-between text-left font-medium text-gray-900 py-2"
            >
              <span>Limitations</span>
              <span className="text-gray-500">{openSection === "limitations" ? "−" : "+"}</span>
            </button>
            {openSection === "limitations" && (
              <ul className="mt-2 space-y-2 pl-4 text-sm text-gray-700">
                {transparency.limitations.map((limitation, index) => (
                  <li key={index} className="list-disc">{limitation}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Methodology */}
          <div className="border-t pt-4">
            <button
              onClick={() => toggleSection("methodology")}
              className="w-full flex items-center justify-between text-left font-medium text-gray-900 py-2"
            >
              <span>Methodology</span>
              <span className="text-gray-500">{openSection === "methodology" ? "−" : "+"}</span>
            </button>
            {openSection === "methodology" && (
              <ul className="mt-2 space-y-2 pl-4 text-sm text-gray-700">
                {transparency.methodology.map((method, index) => (
                  <li key={index} className="list-disc">{method}</li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </Section>
  );
}

