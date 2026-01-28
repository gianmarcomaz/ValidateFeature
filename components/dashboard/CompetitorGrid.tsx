"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

interface Competitor {
    name: string;
    domain?: string;
    url?: string;
    link?: string;
    category: string;
    whatTheyDo?: string;
    whyOverlaps?: string;
    overlapReason?: string;
    evidenceSnippets?: string[];
    confidence?: "high" | "med" | "low";
}

interface CompetitorGridProps {
    competitors: Competitor[];
}

export function CompetitorGrid({ competitors }: CompetitorGridProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    if (!competitors || competitors.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <p className="text-slate-400">No competitors found in the analysis</p>
            </div>
        );
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            "ATS": "bg-purple-500/15 text-purple-400 border-purple-500/30",
            "Resume Optimizer": "bg-blue-500/15 text-blue-400 border-blue-500/30",
            "Screening/Matching": "bg-teal/15 text-teal border-teal/30",
            "Verification/Background": "bg-amber-500/15 text-amber-400 border-amber-500/30",
            "Other": "bg-slate-500/15 text-slate-400 border-slate-500/30",
        };
        return colors[category] || colors["Other"];
    };

    const getConfidenceInfo = (confidence?: string) => {
        if (confidence === "high") return { label: "High Confidence", dots: "●●●", color: "text-teal" };
        if (confidence === "med") return { label: "Medium Confidence", dots: "●●○", color: "text-amber-400" };
        return { label: "Low Confidence", dots: "●○○", color: "text-slate-400" };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Competitor Analysis</h2>
                    <p className="text-sm text-slate-400">
                        {competitors.length} competitors identified in your market
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal"></span> High
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span> Medium
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-500"></span> Low
                    </span>
                </div>
            </div>

            {/* Competitor Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {competitors.map((competitor, index) => {
                    const isExpanded = expandedId === index;
                    const confidenceInfo = getConfidenceInfo(competitor.confidence);
                    const competitorUrl = competitor.url || competitor.link || `https://${competitor.domain}`;
                    const description = competitor.whatTheyDo || competitor.overlapReason;
                    const overlap = competitor.whyOverlaps || competitor.overlapReason;

                    return (
                        <Card
                            key={index}
                            hover
                            className={`transition-all duration-300 ${isExpanded ? 'ring-1 ring-accent/30' : ''}`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {/* Company Icon Placeholder */}
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm">
                                        {competitor.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white">{competitor.name}</h3>
                                        <p className="text-xs text-slate-500">{competitor.domain || new URL(competitorUrl).hostname}</p>
                                    </div>
                                </div>
                                <span className={`${confidenceInfo.color} text-xs`}>
                                    {confidenceInfo.dots}
                                </span>
                            </div>

                            {/* Category Badge */}
                            <div className="mb-3">
                                <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(competitor.category)}`}>
                                    {competitor.category}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                {description || "Competitor in your market space."}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                                <a
                                    href={competitorUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-teal hover:text-teal-light transition-colors flex items-center gap-1"
                                >
                                    Visit Site
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : index)}
                                    className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    {isExpanded ? "Hide Details" : "See Details"}
                                    <svg
                                        className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
                                    {overlap && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Market Overlap</p>
                                            <p className="text-sm text-slate-300">{overlap}</p>
                                        </div>
                                    )}

                                    {competitor.evidenceSnippets && competitor.evidenceSnippets.length > 0 && (
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Evidence</p>
                                            {competitor.evidenceSnippets.map((snippet, idx) => (
                                                <div key={idx} className="p-2 bg-navy-900 rounded-lg text-xs text-slate-400">
                                                    "{snippet}"
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-slate-500">Confidence:</span>
                                        <span className={confidenceInfo.color}>{confidenceInfo.label}</span>
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
