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
import { useMotionConfig } from "@/lib/motion";

// Flexible interface to match Firestore document
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
  const { reduceMotion, fadeUp, staggerContainer } = useMotionConfig();

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sprintLoading, setSprintLoading] = useState(false);
  const [sprints, setSprints] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("verdict");

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

  // Get competitor data from both verdict and evidence
  const getCompetitors = () => {
    const verdictCompetitors = submission?.verdict?.competitorAnalysis || [];
    const evidenceCompetitors = submission?.evidence?.competitors || [];
    // Merge and deduplicate by name
    const allCompetitors = [...evidenceCompetitors, ...verdictCompetitors];
    const uniqueNames = new Set<string>();
    return allCompetitors.filter(c => {
      if (uniqueNames.has(c.name)) return false;
      uniqueNames.add(c.name);
      return true;
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-400">Loading results...</p>
        </div>
      </main>
    );
  }

  if (error || !submission) {
    return (
      <main className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Submission not found"}</p>
          <Link href="/" className="btn-secondary">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  const competitors = getCompetitors();
  const hackerNewsHits = submission.evidence?.hackernews?.hits || [];
  const citations = submission.evidence?.citations || [];
  const googleQueries = submission.evidence?.google?.queries || [];

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: "verdict", label: "Verdict" },
    { id: "market", label: "Market Analysis" },
    { id: "competitors", label: "Competitors", count: competitors.length },
    { id: "evidence", label: "Evidence", count: citations.length },
  ];

  return (
    <main className="min-h-screen bg-navy-900 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(45,212,191,0.05)_0%,_transparent_50%)]" />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {submission.featureTitle || submission.feature?.title}
              </h1>
              <p className="text-slate-400">{submission.featureDescription || submission.feature?.description}</p>
            </div>

            {/* Quick verdict badge */}
            {submission.verdict && (
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${submission.verdict.verdict === "BUILD" ? "bg-teal/20 text-teal border border-teal/30" :
                submission.verdict.verdict === "PIVOT" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                  "bg-red-500/20 text-red-400 border border-red-500/30"
                }`}>
                {submission.verdict.verdict} • {submission.verdict.confidence}
              </div>
            )}
          </div>
        </motion.div>

        {/* Startup Context */}
        {submission.startup && (
          <motion.div
            className="mb-6 p-4 bg-navy-800/60 border border-slate-700/50 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">For</p>
            <p className="text-sm text-white">{submission.startup.name}</p>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-navy-800/60 text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600"
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? "bg-accent/30" : "bg-slate-700"
                    }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "verdict" && (
              <div className="space-y-8">
                {/* Verdict */}
                {submission.verdict && (
                  <VerdictView
                    verdict={submission.verdict.verdict}
                    confidence={submission.verdict.confidence}
                    reasons={submission.verdict.reasons}
                  />
                )}

                {/* Evidence Metrics (condensed) */}
                {submission.evidence && (
                  <EvidenceMetrics evidence={submission.evidence} />
                )}

                {/* Pivot Options */}
                {submission.verdict?.pivotOptions && submission.verdict.pivotOptions.length > 0 && (
                  <PivotOptions options={submission.verdict.pivotOptions} />
                )}

                {/* Transparency */}
                {submission.verdict?.transparency && (
                  <TransparencyPanel
                    transparency={submission.verdict.transparency}
                    evidence={submission.evidence}
                    startup={submission.startup}
                  />
                )}
              </div>
            )}

            {activeTab === "market" && (
              <div className="space-y-8">
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

        {/* Sprint Generation */}
        <motion.div
          className="mt-12 pt-8 border-t border-slate-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {sprints.length === 0 ? (
            <div className="text-center">
              <p className="text-slate-400 mb-4">Ready to test this feature hypothesis?</p>
              <button
                onClick={handleGenerateSprint}
                disabled={sprintLoading}
                className="btn-primary"
              >
                {sprintLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Generating...
                  </span>
                ) : (
                  "Generate Validation Sprint"
                )}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Validation Sprint Plan</h2>
              <SprintPlanView sprint={sprints[sprints.length - 1]} />
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
