"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSubmission, createSprint, getSprint } from "@/lib/firebase/db";
import { SubmissionDocument, SprintDocument } from "@/lib/firebase/db";
import { VerdictView } from "@/components/VerdictView";
import { PivotOptions } from "@/components/PivotOptions";
import { TransparencyPanel } from "@/components/TransparencyPanel";
import { SprintPlanView } from "@/components/SprintPlanView";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";
import { VerdictResponse, ValidationSprint } from "@/lib/domain/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<SubmissionDocument | null>(null);
  const [sprint, setSprint] = useState<ValidationSprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSprint, setIsGeneratingSprint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSprint, setShowSprint] = useState(false);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const data = await getSubmission(submissionId);
      if (!data) {
        setError("Submission not found");
        setIsLoading(false);
        return;
      }
      setSubmission(data);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Error loading submission:", err);
      setError(err.message || "Failed to load submission");
      setIsLoading(false);
    }
  };

  const handleGenerateSprint = async () => {
    if (!submission?.verdict || !submission?.normalized) {
      setError("Missing verdict or normalized data");
      return;
    }

    setIsGeneratingSprint(true);
    setError(null);

    try {
      const response = await fetch("/api/llm/sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verdict: submission.verdict,
          normalized: submission.normalized,
          feature: submission.feature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sprint plan");
      }

      const sprintPlan: ValidationSprint = await response.json();

      // Save sprint to Firestore
      await createSprint(submissionId, sprintPlan);

      setSprint(sprintPlan);
      setShowSprint(true);
      setIsGeneratingSprint(false);
    } catch (err: any) {
      console.error("Error generating sprint:", err);
      setError(err.message || "Failed to generate sprint plan");
      setIsGeneratingSprint(false);
    }
  };

  const handleCopySummary = () => {
    if (!submission?.verdict || !submission?.feature) return;

    const summary = `Feature Validation: ${submission.feature.title}

Verdict: ${submission.verdict.verdict} (${submission.verdict.confidence} confidence)

Key Reasons:
${submission.verdict.reasons.map(r => `- ${r.title}: ${r.detail}`).join("\n")}

${submission.verdict.pivotOptions.length > 0 ? `\nPivot Options:\n${submission.verdict.pivotOptions.map(o => `- ${o.name}: ${o.description}`).join("\n")}` : ""}
`;

    navigator.clipboard.writeText(summary).then(() => {
      alert("Summary copied to clipboard!");
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </main>
    );
  }

  if (error || !submission) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Submission not found"}</p>
            <Link
              href="/"
              className="text-blue-600 hover:underline"
            >
              Go back home
            </Link>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 font-medium mb-6 transition-colors group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {submission.feature.title}
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">{submission.feature.description}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Verdict */}
        {submission.verdict && (
          <>
            <VerdictView verdict={submission.verdict} />

            {/* Pivot Options */}
            {submission.verdict.pivotOptions.length > 0 && (
              <PivotOptions options={submission.verdict.pivotOptions} />
            )}

            {/* Transparency Panel */}
            <TransparencyPanel transparency={submission.verdict.transparency} />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8 mb-8">
              <button
                onClick={handleCopySummary}
                className="px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl font-semibold hover:bg-white hover:shadow-lg border border-slate-200 transition-all duration-300"
              >
                Copy Summary
              </button>
              {!showSprint && (
                <button
                  onClick={handleGenerateSprint}
                  disabled={isGeneratingSprint}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                >
                  {isGeneratingSprint ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" className="inline-block" />
                      Generating...
                    </span>
                  ) : (
                    "Generate Validation Sprint"
                  )}
                </button>
              )}
            </div>

            {/* Sprint Plan */}
            {showSprint && sprint && (
              <div className="mt-8">
                <SprintPlanView sprint={sprint} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

