"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getSubmission, createSprint, getSprint } from "@/lib/firebase/db";
import { SubmissionDocument, SprintDocument } from "@/lib/firebase/db";
import { VerdictView } from "@/components/VerdictView";
import { PivotOptions } from "@/components/PivotOptions";
import { TransparencyPanel } from "@/components/TransparencyPanel";
import { CompetitorsView } from "@/components/CompetitorsView";
import { EvidenceMetrics } from "@/components/EvidenceMetrics";
import { SprintPlanView } from "@/components/SprintPlanView";
import { Spinner } from "@/components/ui/Spinner";
import { useMotionConfig, staggerContainer } from "@/lib/motion";
import { VerdictResponse, ValidationSprint } from "@/lib/domain/types";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;
  const { reduceMotion, fadeUp, staggerContainer: stagger } = useMotionConfig();

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
      
      // Log evidence for debugging
      if (data.evidence) {
        console.log("[Results] Evidence loaded:", {
          hasEvidence: !!data.evidence,
          competitors: data.evidence.competitors?.length || 0,
          competitorSummary: data.evidence.competitorSummary,
          googleCount: data.evidence.google?.queries?.reduce((sum: number, q: any) => sum + (q.items?.length || 0), 0) || 0,
          hnCount: data.evidence.hackernews?.hits?.length || 0,
          signals: data.evidence.signals ? {
            competitor_density: data.evidence.signals.competitor_density,
            evidenceCoverage: data.evidence.signals.evidenceCoverage,
            marketEstablished: data.evidence.signals.marketEstablished,
          } : null,
        });
      } else {
        console.warn("[Results] No evidence found in submission - evidence may not have been stored");
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
            title: submission.feature?.title || submission.featureTitle || "",
            description: submission.feature?.description || submission.featureDescription || "",
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
    if (!submission?.verdict) return;
    const featureTitle = submission.feature?.title || submission.featureTitle || "Feature";

    const summary = `Feature Validation: ${featureTitle}

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
        <motion.div
          className="mb-8"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium mb-6 transition-colors"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
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
          </motion.div>
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent"
            variants={fadeUp}
          >
            {submission.feature?.title || submission.featureTitle}
          </motion.h1>
          <motion.p
            className="text-xl text-slate-300 leading-relaxed"
            variants={fadeUp}
          >
            {submission.feature?.description || submission.featureDescription}
          </motion.p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Startup Context Summary */}
        {submission.startup && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mb-8"
          >
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-2xl font-bold text-slate-100 mb-4">Startup Context</h2>
                <div className="space-y-3 text-slate-300">
                  <div>
                    <span className="font-semibold text-slate-200">Name:</span> {submission.startup.name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Description:</span> {submission.startup.description}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">What It Does:</span> {submission.startup.whatItDoes}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Problem Solved:</span> {submission.startup.problemSolved}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Target Audience:</span> {submission.startup.targetAudience}
                  </div>
                  {submission.startup.websiteUrl && (
                    <div>
                      <span className="font-semibold text-slate-200">Website:</span>{" "}
                      <a
                        href={submission.startup.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 underline"
                      >
                        {submission.startup.websiteUrl}
                      </a>
                    </div>
                  )}
                  {submission.startup.websiteEvidence && submission.startup.websiteEvidence.pages && submission.startup.websiteEvidence.pages.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-200">Pages Analyzed:</span>
                      <ul className="mt-1 ml-4 list-disc space-y-1">
                        {submission.startup.websiteEvidence.pages.map((page, idx) => (
                          <li key={idx}>
                            <a
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300 underline"
                            >
                              {page.title || page.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Verdict */}
        {submission.verdict && (
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div variants={fadeUp}>
              <VerdictView verdict={submission.verdict} />
            </motion.div>

            {/* Evidence Metrics */}
            {submission.evidence ? (
              <motion.div variants={fadeUp}>
                <EvidenceMetrics evidence={submission.evidence} />
              </motion.div>
            ) : (
              <motion.div variants={fadeUp}>
                <div className="rounded-2xl border border-yellow-500/50 bg-yellow-500/20 p-6 backdrop-blur">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-200 mb-1">Evidence Not Available</h3>
                      <p className="text-sm text-yellow-300">
                        Evidence fetch failed or was not stored. The verdict was generated without external market data.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Competitor Analysis */}
            {submission.verdict.competitorAnalysis && submission.verdict.competitorAnalysis.length > 0 && (
              <motion.div variants={fadeUp}>
                <CompetitorsView
                  competitorAnalysis={submission.verdict.competitorAnalysis}
                  evidenceCoverage={submission.evidence?.signals?.evidenceCoverage}
                />
              </motion.div>
            )}

            {/* Pivot Options */}
            {submission.verdict.pivotOptions.length > 0 && (
              <motion.div variants={fadeUp}>
                <PivotOptions options={submission.verdict.pivotOptions} />
              </motion.div>
            )}

            {/* Transparency Panel */}
            <motion.div variants={fadeUp}>
              <TransparencyPanel 
                transparency={submission.verdict.transparency}
                evidence={submission.evidence}
                startup={submission.startup}
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap gap-4 mt-8 mb-8"
              variants={fadeUp}
            >
              <motion.button
                onClick={handleCopySummary}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors duration-200 active:scale-[0.98]"
                whileTap={reduceMotion ? {} : { scale: 0.98 }}
              >
                Copy Summary
              </motion.button>
              {!showSprint && (
                <motion.button
                  onClick={handleGenerateSprint}
                  disabled={isGeneratingSprint}
                  className="group relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-0"
                  whileTap={reduceMotion || isGeneratingSprint ? {} : { scale: 0.98 }}
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="relative flex items-center gap-2">
                    {isGeneratingSprint ? (
                      <>
                        <Spinner size="sm" className="inline-block" />
                        Generating...
                      </>
                    ) : (
                      "Generate Validation Sprint"
                    )}
                  </span>
                </motion.button>
              )}
            </motion.div>

            {/* Sprint Plan */}
            <AnimatePresence>
              {showSprint && sprint && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SprintPlanView sprint={sprint} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}

