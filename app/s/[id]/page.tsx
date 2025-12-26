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
          feature: {
            title: submission.featureTitle,
            description: submission.featureDescription,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to generate sprint plan");
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
    if (!submission?.verdict || !submission?.featureTitle) return;

    const summary = `Feature Validation: ${submission.featureTitle}

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
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <p className="text-slate-300">Loading results...</p>
        </div>
      </main>
    );
  }

  if (error || !submission) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="text-center">
            <p className="text-red-300 mb-4">{error || "Submission not found"}</p>
            <Link
              href="/"
              className="text-cyan-400 hover:underline"
            >
              Go back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {submission.featureTitle}
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">{submission.featureDescription}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
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
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                Copy Summary
              </button>
              {!showSprint && (
                <button
                  onClick={handleGenerateSprint}
                  disabled={isGeneratingSprint}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

