"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Spinner } from "@/components/ui/Spinner";
import type { Mode, GoalMetric, StartupContext, FeatureContext, ICPInput } from "@/lib/domain/types";

export interface FeatureFormData {
  mode: Mode;
  startup?: StartupContext;
  feature: FeatureContext;
  icp: ICPInput;
  goalMetric: GoalMetric;
}

interface IntakeFormProps {
  onSubmit: (data: FeatureFormData) => void;
  isLoading?: boolean;
}

export function IntakeForm({ onSubmit, isLoading = false }: IntakeFormProps) {
  const [mode, setMode] = useState<Mode>("existing");
  const [startupSource, setStartupSource] = useState<"website" | "manual">("manual");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false);
  const [websiteError, setWebsiteError] = useState<string | null>(null);

  // Startup context
  const [startupName, setStartupName] = useState("");
  const [startupDescription, setStartupDescription] = useState("");
  const [startupWhatItDoes, setStartupWhatItDoes] = useState("");
  const [startupProblemSolved, setStartupProblemSolved] = useState("");
  const [startupTargetAudience, setStartupTargetAudience] = useState("");

  // Feature context
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureProblemSolved, setFeatureProblemSolved] = useState("");
  const [featureTargetAudience, setFeatureTargetAudience] = useState("");

  // ICP
  const [icpRole, setIcpRole] = useState("");
  const [icpIndustry, setIcpIndustry] = useState("");
  const [icpCompanySize, setIcpCompanySize] = useState("");

  // Goal
  const [goalMetric, setGoalMetric] = useState<GoalMetric>("activation");

  const handleWebsiteFetch = async () => {
    if (!websiteUrl) return;

    setIsLoadingWebsite(true);
    setWebsiteError(null);

    try {
      const res = await fetch("/api/website-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch website data");
      }

      const data = await res.json();

      setStartupName(data.name || "");
      setStartupDescription(data.description || "");
      setStartupWhatItDoes(data.whatItDoes || "");
      setStartupProblemSolved(data.problemSolved || "");
      setStartupTargetAudience(data.targetAudience || "");
    } catch (err) {
      setWebsiteError("Could not fetch website data. Please enter manually.");
    } finally {
      setIsLoadingWebsite(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: FeatureFormData = {
      mode,
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
    };

    if (mode === "existing") {
      formData.startup = {
        source: startupSource,
        websiteUrl: startupSource === "website" ? websiteUrl : undefined,
        name: startupName,
        description: startupDescription,
        whatItDoes: startupWhatItDoes,
        problemSolved: startupProblemSolved,
        targetAudience: startupTargetAudience,
      };
    }

    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-3 bg-navy-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all duration-200";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* About Your Startup - Always visible */}
      <div className="space-y-6 p-6 bg-navy-900/50 rounded-xl border border-slate-700/50">
        <div>
          <h3 className="text-white font-medium mb-2">About Your Product</h3>
          <p className="text-sm text-slate-400 mb-4">Tell us about your existing product (optional). You can enter details manually or provide your website URL to auto-fill.</p>

          {/* Source Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setStartupSource("website")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${startupSource === "website"
                ? "bg-accent text-white"
                : "bg-transparent text-slate-400 border border-slate-700"
                }`}
            >
              From Website
            </button>
            <button
              type="button"
              onClick={() => setStartupSource("manual")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${startupSource === "manual"
                ? "bg-accent text-white"
                : "bg-transparent text-slate-400 border border-slate-700"
                }`}
            >
              Enter Manually
            </button>
          </div>

          {startupSource === "website" && (
            <div className="flex gap-3 mb-4">
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourcompany.com"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleWebsiteFetch}
                disabled={isLoadingWebsite || !websiteUrl}
                className="btn-primary px-5 whitespace-nowrap disabled:opacity-50"
              >
                {isLoadingWebsite ? <Spinner size="sm" /> : "Fetch"}
              </button>
            </div>
          )}

          {websiteError && (
            <p className="text-red-400 text-sm mb-4">{websiteError}</p>
          )}

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Startup Name</label>
              <input
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                placeholder="e.g., Acme Inc"
                className={inputClass}
                required={mode === "existing"}
              />
            </div>
            <div>
              <label className={labelClass}>What does it do?</label>
              <textarea
                value={startupWhatItDoes}
                onChange={(e) => setStartupWhatItDoes(e.target.value)}
                placeholder="Describe your core product or service"
                rows={2}
                className={inputClass}
                required={mode === "existing"}
              />
            </div>
            <div>
              <label className={labelClass}>Target Audience</label>
              <input
                type="text"
                value={startupTargetAudience}
                onChange={(e) => setStartupTargetAudience(e.target.value)}
                placeholder="e.g., Small business owners"
                className={inputClass}
                required={mode === "existing"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Context */}
      <div className="space-y-4">
        <h3 className="text-white font-medium">Feature Details</h3>

        <div>
          <label className={labelClass}>Feature Title</label>
          <input
            type="text"
            value={featureTitle}
            onChange={(e) => setFeatureTitle(e.target.value)}
            placeholder="e.g., AI-Powered Report Generator"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            placeholder="What does this feature do?"
            rows={3}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Problem it Solves</label>
          <textarea
            value={featureProblemSolved}
            onChange={(e) => setFeatureProblemSolved(e.target.value)}
            placeholder="What pain point does this address?"
            rows={2}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Target Users</label>
          <input
            type="text"
            value={featureTargetAudience}
            onChange={(e) => setFeatureTargetAudience(e.target.value)}
            placeholder="Who will use this feature?"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* ICP */}
      <div className="space-y-4">
        <h3 className="text-white font-medium">Ideal Customer Profile</h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Role / Title</label>
            <input
              type="text"
              value={icpRole}
              onChange={(e) => setIcpRole(e.target.value)}
              placeholder="e.g., Product Manager"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Industry (optional)</label>
            <input
              type="text"
              value={icpIndustry}
              onChange={(e) => setIcpIndustry(e.target.value)}
              placeholder="e.g., SaaS"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Company Size (optional)</label>
            <input
              type="text"
              value={icpCompanySize}
              onChange={(e) => setIcpCompanySize(e.target.value)}
              placeholder="e.g., 10-50 employees"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Goal Metric */}
      <div>
        <label className={labelClass}>Primary Goal Metric</label>
        <select
          value={goalMetric}
          onChange={(e) => setGoalMetric(e.target.value as GoalMetric)}
          className={inputClass}
        >
          <option value="activation">Activation - Get users to experience value</option>
          <option value="retention">Retention - Keep users coming back</option>
          <option value="revenue">Revenue - Drive monetization</option>
          <option value="support">Support - Reduce support burden</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full py-4 text-base disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <Spinner size="sm" />
            Analyzing feature signals...
          </span>
        ) : (
          "Validate This Feature"
        )}
      </button>
    </form>
  );
}
