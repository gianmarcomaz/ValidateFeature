"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Globe, ExternalLink, ChevronDown, ChevronUp, AlertCircle, Search } from "lucide-react";

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
            <div className="text-center py-24 bg-void-900/50 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-void-800 flex items-center justify-center border border-white/5">
                    <Search className="text-slate-600" size={24} />
                </div>
                <p className="text-slate-400 font-medium">No competitors found</p>
                <p className="text-xs text-slate-500 mt-1">We couldn't detect any direct competitors in this market segment.</p>
            </div>
        );
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            "ATS": "bg-purple-500/10 text-purple-400 border-purple-500/20",
            "Resume Optimizer": "bg-blue-500/10 text-blue-400 border-blue-500/20",
            "Screening/Matching": "bg-cyan/10 text-cyan border-cyan/20",
            "Verification/Background": "bg-amber-500/10 text-amber-400 border-amber-500/20",
            "Other": "bg-slate-500/10 text-slate-400 border-slate-500/20",
        };
        return colors[category] || colors["Other"];
    };

    const getConfidenceInfo = (confidence?: string) => {
        if (confidence === "high") return { label: "High Confidence", color: "text-cyan" };
        if (confidence === "med") return { label: "Medium Confidence", color: "text-amber-400" };
        return { label: "Low Confidence", color: "text-slate-500" };
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
                <div className="flex items-center gap-3 text-xs text-slate-500 bg-void-900/50 px-3 py-1.5 rounded-full border border-white/5">
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_5px_var(--cyan)]"></span> High
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Medium
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Low
                    </span>
                </div>
            </div>

            {/* Competitor Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            className={`flex flex-col h-full transition-all duration-300 ${isExpanded ? 'ring-1 ring-accent/50 bg-void-800/80' : 'bg-void-900/40'}`}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {/* Company Icon Placeholder */}
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-void-700 to-void-800 border border-white/5 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                                        {competitor.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white leading-tight">{competitor.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Globe size={10} className="text-slate-500" />
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider truncate max-w-[120px]">
                                                {competitor.domain || new URL(competitorUrl).hostname}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${confidenceInfo.color === 'text-cyan' ? 'bg-cyan shadow-[0_0_8px_var(--cyan)]' : confidenceInfo.color.replace('text-', 'bg-')}`} title={confidenceInfo.label} />
                            </div>

                            {/* Category Badge */}
                            <div className="mb-4">
                                <span className={`text-[10px] font-medium px-2.5 py-1 rounded-md border inline-block ${getCategoryColor(competitor.category)}`}>
                                    {competitor.category}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed flex-grow">
                                {description || "Competitor in your market space."}
                            </p>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <a
                                    href={competitorUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-400 hover:text-cyan transition-colors flex items-center gap-1.5 font-medium group"
                                >
                                    Visit Site
                                    <ExternalLink size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : index)}
                                    className="text-xs text-slate-500 hover:text-white transition-colors flex items-center gap-1.5"
                                >
                                    {isExpanded ? "Hide Details" : "Details"}
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-fade-in text-sm">
                                    {overlap && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">Market Overlap</p>
                                            <p className="text-slate-300 leading-relaxed bg-void-950/50 p-3 rounded-lg border border-white/5">
                                                {overlap}
                                            </p>
                                        </div>
                                    )}

                                    {competitor.evidenceSnippets && competitor.evidenceSnippets.length > 0 && (
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1.5 font-semibold">Evidence</p>
                                            <div className="space-y-2">
                                                {competitor.evidenceSnippets.map((snippet, idx) => (
                                                    <div key={idx} className="p-3 bg-void-950/50 border border-white/5 rounded-lg text-slate-400 italic text-xs">
                                                        "{snippet}"
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
