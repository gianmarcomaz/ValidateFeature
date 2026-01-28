"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ensureAnonymousAuth } from "@/lib/firebase/auth";
import { createSubmission, updateSubmission } from "@/lib/firebase/db";
import { IntakeForm, FeatureFormData } from "@/components/IntakeForm";

export default function NewPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FeatureFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Ensure user is authenticated
      const userId = await ensureAnonymousAuth();
      if (!userId) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      // Create initial submission
      const submissionId = await createSubmission(
        {
          mode: data.mode,
          startup: data.startup,
          feature: data.feature,
          icp: data.icp,
          goalMetric: data.goalMetric,
        },
        userId
      );

      // Normalize the input
      const normalizeRes = await fetch("/api/llm/normalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: data.feature,
          icp: data.icp,
          goalMetric: data.goalMetric,
          mode: data.mode,
        }),
      });

      if (!normalizeRes.ok) {
        const errorData = await normalizeRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to normalize input");
      }

      const normalized = await normalizeRes.json();

      // Update submission with normalized data
      await updateSubmission(submissionId, { normalized });

      // Fetch evidence
      const evidenceRes = await fetch("/api/evidence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: data.feature.title,
          keywords: normalized.keywordQuerySet,
          startup: data.startup,
          feature: data.feature,
        }),
      });

      let evidence = null;
      if (evidenceRes.ok) {
        const evidenceData = await evidenceRes.json();
        evidence = evidenceData.evidence; // Unwrap the evidence object
        await updateSubmission(submissionId, { evidence });
      }

      // Get verdict
      const verdictRes = await fetch("/api/llm/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature: data.feature,
          icp: data.icp,
          goalMetric: data.goalMetric,
          mode: data.mode,
          normalized,
          evidence,
          startup: data.startup,
        }),
      });

      if (!verdictRes.ok) {
        const errorData = await verdictRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get verdict");
      }

      const verdict = await verdictRes.json();

      // Update submission with verdict
      await updateSubmission(submissionId, {
        verdict,
        status: "verdict_ready"
      });

      // Navigate to results
      router.push(`/s/${submissionId}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-900 py-12">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,74,0.05)_0%,_transparent_50%)]" />

      <div className="relative mx-auto max-w-3xl px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            New Validation
          </h1>
          <p className="text-slate-400">
            Tell us about your feature idea and we'll assess its potential
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form Container */}
        <motion.div
          className="bg-navy-800/60 border border-slate-700/50 rounded-2xl p-6 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <IntakeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </motion.div>
      </div>
    </main>
  );
}
