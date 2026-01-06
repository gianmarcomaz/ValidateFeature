"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mode, GoalMetric, StartupContext, FeatureContext } from "@/lib/domain/types";
import { useMotionConfig } from "@/lib/motion";
import { Spinner } from "@/components/ui/Spinner";

interface IntakeFormProps {
  onSubmit: (data: {
    mode: Mode;
    startup?: StartupContext;
    feature: FeatureContext;
    icp: { role: string; industry?: string; companySize?: string };
    goalMetric: GoalMetric;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function IntakeForm({ onSubmit, isLoading = false }: IntakeFormProps) {
  const { reduceMotion, fadeUp } = useMotionConfig();
  const [mode, setMode] = useState<Mode>("early");
  
  // Startup context state
  const [startupTab, setStartupTab] = useState<"website" | "manual">("website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestError, setIngestError] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [startupDescription, setStartupDescription] = useState("");
  const [startupWhatItDoes, setStartupWhatItDoes] = useState("");
  const [startupProblemSolved, setStartupProblemSolved] = useState("");
  const [startupTargetAudience, setStartupTargetAudience] = useState("");
  const [startupBusinessModel, setStartupBusinessModel] = useState("");
  const [startupDifferentiators, setStartupDifferentiators] = useState("");
  
  // Feature context state
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureProblemSolved, setFeatureProblemSolved] = useState("");
  const [featureTargetAudience, setFeatureTargetAudience] = useState("");
  
  // ICP state
  const [icpRole, setIcpRole] = useState("");
  const [icpIndustry, setIcpIndustry] = useState("");
  const [icpCompanySize, setIcpCompanySize] = useState("");
  const [goalMetric, setGoalMetric] = useState<GoalMetric>("activation");

  const handleAutoFill = async () => {
    if (!websiteUrl.trim()) {
      setIngestError("Please enter a website URL");
      return;
    }

    setIsIngesting(true);
    setIngestError(null);

    try {
      const response = await fetch("/api/startup/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || "Failed to ingest website");
      }

      const data = await response.json();
      
      if (data.startup) {
        setStartupName(data.startup.name || "");
        setStartupDescription(data.startup.description || "");
        setStartupWhatItDoes(data.startup.whatItDoes || "");
        setStartupProblemSolved(data.startup.problemSolved || "");
        setStartupTargetAudience(data.startup.targetAudience || "");
        setStartupBusinessModel(data.startup.businessModel || "");
        setStartupDifferentiators(data.startup.differentiators?.join(", ") || "");
      }

      if (data.warnings && data.warnings.length > 0) {
        setIngestError(`Warnings: ${data.warnings.join(", ")}`);
      }
    } catch (err: any) {
      setIngestError(err.message || "Failed to auto-fill from website");
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build startup context if provided
    let startup: StartupContext | undefined;
    if (startupName || startupDescription) {
      startup = {
        source: startupTab,
        websiteUrl: startupTab === "website" ? websiteUrl : undefined,
        name: startupName,
        description: startupDescription,
        whatItDoes: startupWhatItDoes,
        problemSolved: startupProblemSolved,
        targetAudience: startupTargetAudience,
        businessModel: startupBusinessModel || undefined,
        differentiators: startupDifferentiators ? startupDifferentiators.split(",").map(d => d.trim()).filter(Boolean) : undefined,
      };
    }
    
    await onSubmit({
      mode,
      startup,
      feature: {
        title: featureTitle,
        description: featureDescription,
        problemSolved: featureProblemSolved,
        targetAudience: featureTargetAudience,
      },
      icp: {
        role: icpRole,
        industry: icpIndustry || undefined,
        companySize: icpCompanySize || undefined,
      },
      goalMetric,
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-2">
          Mode
        </label>
        <div className="flex gap-4">
          <label className="flex items-center text-slate-300">
            <input
              type="radio"
              name="mode"
              value="early"
              checked={mode === "early"}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="mr-2"
            />
            Early-stage founder
          </label>
          <label className="flex items-center text-slate-300">
            <input
              type="radio"
              name="mode"
              value="existing"
              checked={mode === "existing"}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="mr-2"
            />
            Existing startup
          </label>
        </div>
      </div>

      {/* Startup Context Section */}
      <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Startup Context</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setStartupTab("website")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              startupTab === "website"
                ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50"
                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            Website Link (Auto-fill)
          </button>
          <button
            type="button"
            onClick={() => setStartupTab("manual")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              startupTab === "manual"
                ? "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/50"
                : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
            }`}
          >
            Manual
          </button>
        </div>

        {startupTab === "website" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="website-url" className="block text-sm font-semibold text-slate-200 mb-2">
                Website URL
              </label>
              <div className="flex gap-2">
                <input
                  id="website-url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="flex-1 px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
                  placeholder="https://example.com"
                />
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={isIngesting || !websiteUrl.trim()}
                  className="px-4 py-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isIngesting ? <Spinner size="sm" /> : "Auto-fill"}
                </button>
              </div>
              {ingestError && (
                <p className="mt-2 text-sm text-yellow-300">{ingestError}</p>
              )}
            </div>
          </div>
        ) : null}

        {/* Startup fields (editable after auto-fill) */}
        <div className="space-y-4">
          <div>
            <label htmlFor="startup-name" className="block text-sm font-semibold text-slate-200 mb-2">
              Startup Name *
            </label>
            <input
              id="startup-name"
              type="text"
              required
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
              placeholder="Your startup name"
            />
          </div>

          <div>
            <label htmlFor="startup-description" className="block text-sm font-semibold text-slate-200 mb-2">
              Description *
            </label>
            <textarea
              id="startup-description"
              required
              value={startupDescription}
              onChange={(e) => setStartupDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200 resize-none"
              placeholder="Brief description of your startup"
            />
          </div>

          <div>
            <label htmlFor="startup-what-it-does" className="block text-sm font-semibold text-slate-200 mb-2">
              What It Does *
            </label>
            <textarea
              id="startup-what-it-does"
              required
              value={startupWhatItDoes}
              onChange={(e) => setStartupWhatItDoes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200 resize-none"
              placeholder="What your product/service does"
            />
          </div>

          <div>
            <label htmlFor="startup-problem-solved" className="block text-sm font-semibold text-slate-200 mb-2">
              Problem Solved *
            </label>
            <textarea
              id="startup-problem-solved"
              required
              value={startupProblemSolved}
              onChange={(e) => setStartupProblemSolved(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200 resize-none"
              placeholder="What problem does your startup solve?"
            />
          </div>

          <div>
            <label htmlFor="startup-target-audience" className="block text-sm font-semibold text-slate-200 mb-2">
              Target Audience *
            </label>
            <input
              id="startup-target-audience"
              type="text"
              required
              value={startupTargetAudience}
              onChange={(e) => setStartupTargetAudience(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
              placeholder="Who is your target audience?"
            />
          </div>

          <div>
            <label htmlFor="startup-business-model" className="block text-sm font-semibold text-slate-200 mb-2">
              Business Model (Optional)
            </label>
            <input
              id="startup-business-model"
              type="text"
              value={startupBusinessModel}
              onChange={(e) => setStartupBusinessModel(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
              placeholder="How do you make money?"
            />
          </div>

          <div>
            <label htmlFor="startup-differentiators" className="block text-sm font-semibold text-slate-200 mb-2">
              Differentiators (Optional, comma-separated)
            </label>
            <input
              id="startup-differentiators"
              type="text"
              value={startupDifferentiators}
              onChange={(e) => setStartupDifferentiators(e.target.value)}
              className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
              placeholder="Key differentiators, separated by commas"
            />
          </div>
        </div>
      </div>

      {/* Feature Context Section */}
      <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/5">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Feature Context</h2>

        <div>
          <label htmlFor="feature-title" className="block text-sm font-semibold text-slate-200 mb-2">
            Feature Title *
          </label>
          <input
            id="feature-title"
            type="text"
            required
            value={featureTitle}
            onChange={(e) => setFeatureTitle(e.target.value)}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
            placeholder="e.g., AI-powered code review assistant"
          />
        </div>

        <div>
          <label htmlFor="feature-description" className="block text-sm font-semibold text-slate-200 mb-2">
            Feature Description *
          </label>
          <textarea
            id="feature-description"
            required
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200 resize-none"
            placeholder="Describe the feature idea and how it works..."
          />
        </div>

        <div>
          <label htmlFor="feature-problem-solved" className="block text-sm font-semibold text-slate-200 mb-2">
            Problem Solved *
          </label>
          <textarea
            id="feature-problem-solved"
            required
            value={featureProblemSolved}
            onChange={(e) => setFeatureProblemSolved(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200 resize-none"
            placeholder="What problem does this feature solve?"
          />
        </div>

        <div>
          <label htmlFor="feature-target-audience" className="block text-sm font-semibold text-slate-200 mb-2">
            Target Audience *
          </label>
          <input
            id="feature-target-audience"
            type="text"
            required
            value={featureTargetAudience}
            onChange={(e) => setFeatureTargetAudience(e.target.value)}
            className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
            placeholder="Who is the target audience for this feature?"
          />
        </div>
      </div>

      {/* ICP Role */}
      <div>
        <label htmlFor="icp-role" className="block text-sm font-semibold text-slate-200 mb-2">
          Target User Role (ICP) *
        </label>
        <input
          id="icp-role"
          type="text"
          required
          value={icpRole}
          onChange={(e) => setIcpRole(e.target.value)}
          className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
          placeholder="e.g., Software Engineer, Product Manager, CEO"
        />
      </div>

      {/* ICP Industry (Optional) */}
      <div>
        <label htmlFor="icp-industry" className="block text-sm font-semibold text-slate-200 mb-2">
          Industry (Optional)
        </label>
        <input
          id="icp-industry"
          type="text"
          value={icpIndustry}
          onChange={(e) => setIcpIndustry(e.target.value)}
          className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
          placeholder="e.g., SaaS, FinTech, Healthcare"
        />
      </div>

      {/* ICP Company Size (Optional) */}
      <div>
        <label htmlFor="icp-company-size" className="block text-sm font-semibold text-slate-200 mb-2">
          Company Size (Optional)
        </label>
        <input
          id="icp-company-size"
          type="text"
          value={icpCompanySize}
          onChange={(e) => setIcpCompanySize(e.target.value)}
          className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
          placeholder="e.g., 1-10, 11-50, 51-200, 201+"
        />
      </div>

      {/* Goal Metric */}
      <div>
        <label htmlFor="goal-metric" className="block text-sm font-semibold text-slate-200 mb-2">
          Goal Metric *
        </label>
        <select
          id="goal-metric"
          required
          value={goalMetric}
          onChange={(e) => setGoalMetric(e.target.value as GoalMetric)}
          className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200"
        >
          <option value="activation" className="bg-slate-900">Activation</option>
          <option value="retention" className="bg-slate-900">Retention</option>
          <option value="revenue" className="bg-slate-900">Revenue</option>
          <option value="support" className="bg-slate-900">Support Reduction</option>
        </select>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className="group relative w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:shadow-fuchsia-500/25 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-0"
        whileTap={reduceMotion ? {} : { scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-fuchsia-500/30 to-cyan-500/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <span className="relative flex items-center gap-2">
          {isLoading && (
            <motion.svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </motion.svg>
          )}
          {isLoading ? "Processing..." : "Get Instant Verdict"}
        </span>
      </motion.button>
    </motion.form>
  );
}
