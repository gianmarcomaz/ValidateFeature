"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IntakeForm } from "@/components/IntakeForm";
import { Spinner } from "@/components/ui/Spinner";
import { createSubmission, updateSubmission, updateSubmissionNormalized, updateSubmissionVerdict } from "@/lib/firebase/db";
import { SubmissionInput } from "@/lib/domain/types";

export default function NewFeaturePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SubmissionInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create submission in Firestore (status: "draft") - no auth required for MVP
      const submissionId = await createSubmission(data, null);

      // Call normalize API
      const normalizeRes = await fetch("/api/llm/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!normalizeRes.ok) {
        const errorData = await normalizeRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to normalize feature");
      }

      const normalized = await normalizeRes.json();

      // Update submission with normalized data
      await updateSubmissionNormalized(submissionId, normalized);

      // Call verdict API
      const verdictRes = await fetch("/api/llm/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          normalized,
        }),
      });

      if (!verdictRes.ok) {
        const errorData = await verdictRes.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to generate verdict");
      }

      const verdict = await verdictRes.json();

      // Create placeholder signals
      const signals = {
        trends: { status: "TODO" as const },
        community: { status: "TODO" as const },
        competitors: { status: "TODO" as const },
      };

      // Update submission with verdict (sets status to "verdict_ready") and signals
      await updateSubmissionVerdict(submissionId, verdict);
      await updateSubmission(submissionId, { signals });

      // Redirect to results page
      router.push(`/s/${submissionId}`);
    } catch (err: any) {
      console.error("Error submitting feature:", err);
      setError(err.message || "Failed to process feature. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="py-12">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Validate a New Feature
          </h1>
          <p className="text-xl text-slate-300">
            Describe your feature idea and target user to get an instant verdict
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-slate-300">Processing your feature idea...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur">
            <IntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
}

