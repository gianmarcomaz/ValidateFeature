"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getSubmission, createSprint, listSprints } from "@/lib/firebase/db";
import { Spinner } from "@/components/ui/Spinner";
import { VerdictView } from "@/components/VerdictView";
import { PivotOptions } from "@/components/PivotOptions";
import { EvidenceMetrics } from "@/components/EvidenceMetrics";
import { TransparencyPanel } from "@/components/TransparencyPanel";
import { SprintPlanView } from "@/components/SprintPlanView";
import { MarketOverview, CompetitorGrid, MarketTrends, EvidenceSources } from "@/components/dashboard";
import { DashboardSidebar } from "@/components/ui/DashboardSidebar";
import { ProgressStepper } from "@/components/ProgressStepper";
import { filterCompetitors, normalizeCompetitors } from "@/lib/utils/competitor-utils";
import { ArrowRight, Sparkles, AlertCircle, Clock } from "lucide-react";

interface Submission {
  id?: string;
  feature?: { title?: string; description?: string };
  featureTitle?: string;
  featureDescription?: string;
  mode: string;
  goalMetric: string;
  verdict?: any;
  evidence?: any;
  startup?: any;
  sprints?: any[];
  // Progressive processing fields
  status?: string;
  stage?: string;
  timings?: { submitMs?: number; normalizeMs?: number; evidenceMs?: number; verdictMs?: number; totalMs?: number };
  processingError?: string;
}

type TabType = "verdict" | "market" | "competitors" | "evidence";

// Polling interval in milliseconds
const POLL_INTERVAL_MS = 1000;

export default function SubmissionPage() {
  const params = useParams();
  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [sprints, setSprints] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("verdict");
  const [pollCount, setPollCount] = useState(0);

  // Check if processing is complete
  const isProcessingComplete = useCallback((sub: Submission | null) => {
    if (!sub) return false;
    return sub.stage === "complete" || sub.stage === "partial" || sub.status === "verdict_ready";
  }, []);

  // Fetch submission data
  const fetchSubmission = useCallback(async () => {
    try {
      const data = await getSubmission(id);
      if (!data) {
        setError("Submission not found");
        return null;
      }

      // Handle potential double-wrapped evidence from previous bugs
      if (data.evidence && (data.evidence as any).evidence) {
        data.evidence = (data.evidence as any).evidence;
      }
      setSubmission(data as Submission);
      return data as Submission;
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError("Failed to load submission");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch and polling
  useEffect(() => {
    let pollTimer: NodeJS.Timeout | null = null;

    async function initAndPoll() {
      // Initial fetch
      const data = await fetchSubmission();

      // Fetch existing sprints
      if (data) {
        try {
          const existingSprints = await listSprints(id);
          setSprints(existingSprints);
        } catch (err) {
          console.error("Error fetching sprints:", err);
        }
      }

      // Start polling if not complete
      if (data && !isProcessingComplete(data)) {
        pollTimer = setInterval(async () => {
          setPollCount(c => c + 1);
          const updated = await fetchSubmission();

          // Stop polling when complete
          if (isProcessingComplete(updated)) {
            if (pollTimer) {
              clearInterval(pollTimer);
              pollTimer = null;
            }
          }
        }, POLL_INTERVAL_MS);
      }
    }

    initAndPoll();

    // Cleanup
    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  }, [id, fetchSubmission, isProcessingComplete]);

  const handleGenerateSprint = async () => {
    if (!submission || !submission.verdict) return;

    setSprintLoading(true);
    try {
      const res = await fetch("/api/llm/sprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verdict: submission.verdict,
          feature: {
            title: submission.featureTitle,
            description: submission.featureDescription,
          },
          mode: submission.mode,
          goalMetric: submission.goalMetric,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate sprint");
      }

      const sprintData = await res.json();
      await createSprint(id, sprintData);
      setSprints([...sprints, { ...sprintData, createdAt: Date.now() }]);
    } catch (err) {
      console.error("Error generating sprint:", err);
    } finally {
      setSprintLoading(false);
    }
  };

  const getCompetitors = () => {
    const verdictCompetitors = submission?.verdict?.competitorAnalysis || [];
    const evidenceCompetitors = submission?.evidence?.competitors || [];
    const allCompetitors = [...evidenceCompetitors, ...verdictCompetitors];

    // Filter out non-competitors (blog posts, directories, "top tools" articles, etc.)
    const filtered = filterCompetitors(allCompetitors);

    // Normalize to consistent data structure
    const normalized = normalizeCompetitors(filtered);

    // Deduplicate by name
    const uniqueNames = new Set<string>();
    return normalized.filter((c) => {
      if (uniqueNames.has(c.name)) return false;
      uniqueNames.add(c.name);
      return true;
    });
  };

  // Initial loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-400 animate-pulse">Loading feature analysis...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !submission) {
    return (
      <main className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-void-900 border border-white/5 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-6 font-medium">{error || "Submission not found"}</p>
          <Link href="/" className="btn-secondary w-full">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  // Check if still processing
  const isProcessing = !isProcessingComplete(submission);
  const competitors = getCompetitors();
  const hackerNewsHits = submission.evidence?.hackernews?.hits || [];
  const citations = submission.evidence?.citations || [];
  const googleQueries = submission.evidence?.google?.queries || [];

  return (
    <div className="min-h-screen bg-void-950 flex font-sans text-slate-300 selection:bg-accent/30 selection:text-white overflow-hidden">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        title={submission.featureTitle}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 h-screen overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">

          {/* Progress Stepper (shown during processing) */}
          {isProcessing && (
            <motion.div
              className="mb-8 p-6 bg-void-900/50 border border-white/5 rounded-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-teal animate-pulse" />
                <h2 className="text-lg font-semibold text-white">Feature Validation in Progress</h2>
              </div>
              <ProgressStepper stage={submission.stage} />
            </motion.div>
          )}

          {/* Processing Error */}
          {submission.processingError && (
            <motion.div
              className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <p className="text-amber-300 text-sm">{submission.processingError}</p>
              </div>
            </motion.div>
          )}

          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/5">
            <div className="space-y-4 max-w-2xl">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                  {submission.featureTitle || submission.feature?.title}
                </h1>
                <p className="text-slate-400 mt-2 text-lg leading-relaxed">
                  {submission.featureDescription || submission.feature?.description}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex items-center gap-3">
                {submission.verdict && (
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${submission.verdict.verdict === "BUILD" ? "bg-teal/10 text-teal border-teal/20" :
                    submission.verdict.verdict === "PIVOT" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                    {submission.verdict.verdict}
                  </div>
                )}
                {isProcessing && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20 flex items-center gap-2">
                    <Spinner size="sm" />
                    Processing...
                  </div>
                )}
                {submission.startup && (
                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-void-800 border border-white/5 text-slate-400">
                    {submission.startup.name}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleGenerateSprint}
                disabled={sprintLoading || !submission.verdict}
                className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 disabled:opacity-50"
              >
                {sprintLoading ? (
                  <>
                    <Spinner size="sm" /> Generating Plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate Sprint
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-[60vh]"
            >
              {activeTab === "verdict" && (
                <div className="space-y-10 animate-fade-in">
                  {/* Verdict View */}
                  {submission.verdict ? (
                    <VerdictView
                      verdict={submission.verdict.verdict}
                      confidence={submission.verdict.confidence}
                      reasons={submission.verdict.reasons}
                    />
                  ) : isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Spinner size="lg" />
                      <p className="mt-4 text-slate-400">Evaluating feature viability...</p>
                      <p className="mt-2 text-slate-500 text-sm">Analyzing market signals...</p>
                    </div>
                  ) : null}

                  {/* Evidence Metrics */}
                  {submission.evidence && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <EvidenceMetrics evidence={submission.evidence} />
                      {submission.verdict?.transparency && (
                        <TransparencyPanel
                          transparency={submission.verdict.transparency}
                          evidence={submission.evidence}
                          startup={submission.startup}
                        />
                      )}
                    </div>
                  )}

                  {/* Pivot Options */}
                  {submission.verdict?.pivotOptions && submission.verdict.pivotOptions.length > 0 && (
                    <div className="pt-8 border-t border-white/5">
                      <h3 className="text-lg font-semibold text-white mb-6">Strategic Pivot Options</h3>
                      <PivotOptions options={submission.verdict.pivotOptions} />
                    </div>
                  )}

                  {/* Sprints Section if exist */}
                  {sprints.length > 0 && (
                    <div className="pt-8 border-t border-white/5">
                      <h3 className="text-lg font-semibold text-white mb-6">Validation Sprint Plan</h3>
                      <SprintPlanView sprint={sprints[sprints.length - 1]} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === "market" && (
                <div className="space-y-10">
                  {submission.evidence ? (
                    <>
                      <MarketOverview
                        signals={submission.evidence?.signals}
                        competitorCount={competitors.length}
                        competitorSummary={submission.evidence?.competitorSummary}
                      />
                      <MarketTrends
                        hackerNewsHits={hackerNewsHits}
                        recencyScore={submission.evidence?.signals?.recency_score}
                      />
                    </>
                  ) : isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Spinner size="lg" />
                      <p className="mt-4 text-slate-400">Gathering market intelligence...</p>
                    </div>
                  ) : null}
                </div>
              )}

              {activeTab === "competitors" && (
                competitors.length > 0 ? (
                  <CompetitorGrid competitors={competitors} />
                ) : isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-400">Analyzing competitors...</p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-16">No competitors found</p>
                )
              )}

              {activeTab === "evidence" && (
                submission.evidence ? (
                  <EvidenceSources
                    citations={citations}
                    googleQueries={googleQueries}
                    hackerNewsHits={hackerNewsHits}
                    warnings={submission.evidence?.warnings}
                  />
                ) : isProcessing ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-400">Searching for evidence...</p>
                  </div>
                ) : null
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
            <p>Feature Validation Report • Market data is real-time</p>
            {submission.timings?.totalMs && (
              <p className="mt-1 text-xs text-slate-700">
                Processed in {(submission.timings.totalMs / 1000).toFixed(1)}s
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
