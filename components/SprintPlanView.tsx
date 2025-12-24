"use client";

import { ValidationSprint } from "@/lib/domain/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";

interface SprintPlanViewProps {
  sprint: ValidationSprint;
}

export function SprintPlanView({ sprint }: SprintPlanViewProps) {
  return (
    <div className="space-y-6">
      {/* Tests */}
      <Section title="Validation Tests">
        <div className="space-y-4">
          {sprint.tests.map((test, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="capitalize">{test.type.replace("-", " ")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                    {test.steps.map((step, stepIndex) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Success Threshold:</p>
                  <p className="text-sm text-blue-600">{test.successThreshold}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Survey */}
      <Section title="Survey">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Introduction:</p>
              <p className="text-sm text-gray-700">{sprint.survey.intro}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Questions:</p>
              <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                {sprint.survey.questions.map((question, index) => (
                  <li key={index}>
                    <span className="font-medium">{question.question}</span>
                    {question.options && question.options.length > 0 && (
                      <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex}>{option}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Outreach Templates */}
      <Section title="Outreach Templates">
        <div className="space-y-4">
          {sprint.outreachTemplates.map((template, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="capitalize">{template.platform}</CardTitle>
                {template.subject && (
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {template.body}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

