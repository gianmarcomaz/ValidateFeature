"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IntakeForm } from "@/components/IntakeForm";
import { Spinner } from "@/components/ui/Spinner";
import { createSubmission, updateSubmission } from "@/lib/firebase/db";
import { SubmissionInput } from "@/lib/domain/types";

export default function NewFeaturePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SubmissionInput) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create submission in Firestore
      const submissionId = await createSubmission(data);

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
      await updateSubmission(submissionId, { normalized });

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
        trends: { status: "TODO" },
        community: { status: "TODO" },
        competitors: { status: "TODO" },
      };

      // Update submission with verdict and signals
      await updateSubmission(submissionId, { 
        verdict,
        signals,
      });

      // Redirect to results page
      router.push(`/s/${submissionId}`);
    } catch (err: any) {
      console.error("Error submitting feature:", err);
      setError(err.message || "Failed to process feature. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Validate a New Feature
          </h1>
          <p className="text-xl text-slate-600">
            Describe your feature idea and target user to get an instant verdict
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4" />
              <p className="text-gray-600">Processing your feature idea...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8 md:p-10">
            <IntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}
      </div>
    </main>
  );
}

