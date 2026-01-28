"use client";

import { useEffect, useState } from "react";
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
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";

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
}

type TabType = "verdict" | "market" | "competitors" | "evidence";

export default function SubmissionPage() {
  const params = useParams();
  const id = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [sprints, setSprints] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("verdict");

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const data = await getSubmission(id);
        if (!data) {
          setError("Submission not found");
        } else {
          // Handle potential double-wrapped evidence from previous bugs
          if (data.evidence && (data.evidence as any).evidence) {
            data.evidence = (data.evidence as any).evidence;
          }
          setSubmission(data as Submission);
          // Fetch existing sprints
          const existingSprints = await listSprints(id);
          setSprints(existingSprints);
        }
      } catch (err) {
        console.error("Error fetching submission:", err);
        setError("Failed to load submission");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [id]);

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
    // Merge and deduplicate by name
    const allCompetitors = [...evidenceCompetitors, ...verdictCompetitors];
    const uniqueNames = new Set<string>();
    return allCompetitors.filter((c) => {
      if (uniqueNames.has(c.name)) return false;
      uniqueNames.add(c.name);
      return true;
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-void-950 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-400 animate-pulse">Analyzing market signals...</p>
        </div>
      </main>
    );
  }

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
                disabled={sprintLoading}
                className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5"
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
                  {submission.verdict && (
                    <VerdictView
                      verdict={submission.verdict.verdict}
                      confidence={submission.verdict.confidence}
                      reasons={submission.verdict.reasons}
                    />
                  )}

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
                  <MarketOverview
                    signals={submission.evidence?.signals}
                    competitorCount={competitors.length}
                    competitorSummary={submission.evidence?.competitorSummary}
                  />
                  <MarketTrends
                    hackerNewsHits={hackerNewsHits}
                    recencyScore={submission.evidence?.signals?.recency_score}
                  />
                </div>
              )}

              {activeTab === "competitors" && (
                <CompetitorGrid competitors={competitors} />
              )}

              {activeTab === "evidence" && (
                <EvidenceSources
                  citations={citations}
                  googleQueries={googleQueries}
                  hackerNewsHits={hackerNewsHits}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-white/5 text-center text-slate-600 text-sm">
            <p>Generated by Validate AI • Market data is real-time</p>
          </div>

        </div>
      </main>
    </div>
  );
}
