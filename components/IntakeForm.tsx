"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mode, GoalMetric } from "@/lib/domain/types";
import { useMotionConfig } from "@/lib/motion";

interface IntakeFormProps {
  onSubmit: (data: {
    mode: Mode;
    feature: { title: string; description: string };
    icp: { role: string; industry?: string; companySize?: string };
    goalMetric: GoalMetric;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function IntakeForm({ onSubmit, isLoading = false }: IntakeFormProps) {
  const { reduceMotion, fadeUp } = useMotionConfig();
  const [mode, setMode] = useState<Mode>("early");
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [icpRole, setIcpRole] = useState("");
  const [icpIndustry, setIcpIndustry] = useState("");
  const [icpCompanySize, setIcpCompanySize] = useState("");
  const [goalMetric, setGoalMetric] = useState<GoalMetric>("activation");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      mode,
      feature: {
        title: featureTitle,
        description: featureDescription,
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
      className="space-y-6"
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

      {/* Feature Title */}
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

      {/* Feature Description */}
      <div>
        <label htmlFor="feature-description" className="block text-sm font-semibold text-slate-200 mb-2">
          Feature Description *
        </label>
        <textarea
          id="feature-description"
          required
          value={featureDescription}
          onChange={(e) => setFeatureDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400 focus:bg-white/15 focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-colors duration-200 resize-none"
          placeholder="Describe the feature idea, what problem it solves, and how it works..."
        />
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

