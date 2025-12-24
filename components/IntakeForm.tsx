"use client";

import { useState } from "react";
import { Mode, GoalMetric } from "@/lib/domain/types";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Mode
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
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
          <label className="flex items-center">
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
        <label htmlFor="feature-title" className="block text-sm font-semibold text-slate-700 mb-2">
          Feature Title *
        </label>
        <input
          id="feature-title"
          type="text"
          required
          value={featureTitle}
          onChange={(e) => setFeatureTitle(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
          placeholder="e.g., AI-powered code review assistant"
        />
      </div>

      {/* Feature Description */}
      <div>
        <label htmlFor="feature-description" className="block text-sm font-semibold text-slate-700 mb-2">
          Feature Description *
        </label>
        <textarea
          id="feature-description"
          required
          value={featureDescription}
          onChange={(e) => setFeatureDescription(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all duration-200 resize-none"
          placeholder="Describe the feature idea, what problem it solves, and how it works..."
        />
      </div>

      {/* ICP Role */}
      <div>
        <label htmlFor="icp-role" className="block text-sm font-semibold text-slate-700 mb-2">
          Target User Role (ICP) *
        </label>
        <input
          id="icp-role"
          type="text"
          required
          value={icpRole}
          onChange={(e) => setIcpRole(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
          placeholder="e.g., Software Engineer, Product Manager, CEO"
        />
      </div>

      {/* ICP Industry (Optional) */}
      <div>
        <label htmlFor="icp-industry" className="block text-sm font-semibold text-slate-700 mb-2">
          Industry (Optional)
        </label>
        <input
          id="icp-industry"
          type="text"
          value={icpIndustry}
          onChange={(e) => setIcpIndustry(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
          placeholder="e.g., SaaS, FinTech, Healthcare"
        />
      </div>

      {/* ICP Company Size (Optional) */}
      <div>
        <label htmlFor="icp-company-size" className="block text-sm font-semibold text-slate-700 mb-2">
          Company Size (Optional)
        </label>
        <input
          id="icp-company-size"
          type="text"
          value={icpCompanySize}
          onChange={(e) => setIcpCompanySize(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
          placeholder="e.g., 1-10, 11-50, 51-200, 201+"
        />
      </div>

      {/* Goal Metric */}
      <div>
        <label htmlFor="goal-metric" className="block text-sm font-semibold text-slate-700 mb-2">
          Goal Metric *
        </label>
        <select
          id="goal-metric"
          required
          value={goalMetric}
          onChange={(e) => setGoalMetric(e.target.value as GoalMetric)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 bg-white/80 backdrop-blur-sm transition-all duration-200"
        >
          <option value="activation">Activation</option>
          <option value="retention">Retention</option>
          <option value="revenue">Revenue</option>
          <option value="support">Support Reduction</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02]"
      >
        {isLoading ? "Processing..." : "Get Instant Verdict"}
      </button>
    </form>
  );
}

