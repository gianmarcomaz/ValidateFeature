"use client";

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface ValidationTest {
  type: "fake-door" | "micro-poll" | "waitlist" | "interview";
  steps: string[];
  successThreshold: string;
}

interface SurveyQuestion {
  question: string;
  type: "text" | "multiple-choice" | "scale" | "boolean";
  options?: string[];
  required: boolean;
}

interface OutreachTemplate {
  platform: "linkedin" | "email";
  subject?: string;
  body: string;
}

interface SprintPlanViewProps {
  sprint: {
    tests: ValidationTest[];
    survey: {
      questions: SurveyQuestion[];
      intro: string;
    };
    outreachTemplates: OutreachTemplate[];
  };
}

export function SprintPlanView({ sprint }: SprintPlanViewProps) {
  const testTypeLabels = {
    "fake-door": "Fake Door Test",
    "micro-poll": "Micro Poll",
    "waitlist": "Waitlist Landing",
    "interview": "User Interview",
  };

  return (
    <div className="space-y-8">
      {/* Validation Tests */}
      <Section title="Validation Tests">
        <div className="space-y-4">
          {sprint.tests.map((test, index) => (
            <Card key={index} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-white">{testTypeLabels[test.type]}</h4>
                  <p className="text-xs text-slate-500">Success: {test.successThreshold}</p>
                </div>
              </div>

              <ol className="space-y-2 pl-11">
                {test.steps.map((step, stepIdx) => (
                  <li key={stepIdx} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-slate-600">{stepIdx + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </div>
      </Section>

      {/* Survey Questions */}
      <Section title="Survey Questions">
        <Card>
          <p className="text-sm text-slate-400 mb-4 italic">{sprint.survey.intro}</p>
          <div className="space-y-3">
            {sprint.survey.questions.map((q, index) => (
              <div key={index} className="p-3 bg-navy-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-slate-600 mt-0.5">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm text-white">{q.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 capitalize">{q.type}</span>
                      {q.required && <span className="text-xs text-accent">Required</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Outreach Templates */}
      <Section title="Outreach Templates">
        <div className="space-y-4">
          {sprint.outreachTemplates.map((template, index) => (
            <Card key={index}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300 capitalize">
                  {template.platform}
                </span>
                {template.subject && (
                  <span className="text-sm text-slate-400">&quot;{template.subject}&quot;</span>
                )}
              </div>
              <div className="p-3 bg-navy-900 rounded-lg">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans">{template.body}</pre>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
