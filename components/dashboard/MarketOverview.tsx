"use client";

import { Card } from "@/components/ui/Card";
import { Users, Activity, Zap, FileText, Info } from "lucide-react";

interface MarketOverviewProps {
    signals?: {
        competitor_density: number;
        recency_score: number;
        pain_signal: number;
        overall_evidence_score: number;
        evidenceCoverage: number;
        marketEstablished: boolean;
        notes?: string[];
    };
    competitorCount: number;
    competitorSummary?: {
        totalCompetitorsFound: number;
        saturationSignal: "low" | "medium" | "high";
    };
}

export function MarketOverview({ signals, competitorCount, competitorSummary }: MarketOverviewProps) {
    if (!signals) {
        return null;
    }

    const getSaturationLevel = (density: number) => {
        if (density >= 70) return { label: "High", color: "text-red-400", bgColor: "bg-red-500/20", dots: 5 };
        if (density >= 40) return { label: "Medium", color: "text-amber-400", bgColor: "bg-amber-500/20", dots: 3 };
        return { label: "Low", color: "text-cyan", bgColor: "bg-cyan/20", dots: 1 };
    };

    const getRecencyLabel = (score: number) => {
        if (score >= 70) return { label: "Very Active", color: "text-cyan" };
        if (score >= 40) return { label: "Active", color: "text-amber-400" };
        return { label: "Quiet", color: "text-slate-400" };
    };

    const saturation = getSaturationLevel(signals.competitor_density);
    const recency = getRecencyLabel(signals.recency_score);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-1">Market Intelligence</h2>
                <p className="text-sm text-slate-400">
                    Analysis based on {competitorCount} similar features and real-time market signals
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Competitors Found */}
                <Card className="text-center relative overflow-hidden group">
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                        <Users size={14} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-2">{competitorCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Similar Features Found</p>
                    <div className={`mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${saturation.bgColor} ${saturation.color}`}>
                        {saturation.label} Saturation
                    </div>
                </Card>

                {/* Pain Signal */}
                <Card className="text-center relative overflow-hidden group">
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                        <Activity size={14} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-2">{Math.round(signals.pain_signal)}%</p>
                    <p className="text-xs text-slate-500 mt-1">Pain Signal</p>
                    <div className="mt-3 w-full h-1.5 bg-void-950/50 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${signals.pain_signal}%`,
                                background: "linear-gradient(90deg, #ff6b4a 0%, #2dd4bf 100%)",
                                boxShadow: "0 0 10px rgba(255, 107, 74, 0.4)"
                            }}
                        />
                    </div>
                </Card>

                {/* Market Activity */}
                <Card className="text-center relative overflow-hidden group">
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                        <Zap size={14} />
                    </div>
                    <p className={`text-3xl font-bold mt-2 ${recency.color}`}>{recency.label}</p>
                    <p className="text-xs text-slate-500 mt-1">Market Activity</p>
                    <p className="text-xs text-slate-600 mt-2">
                        Recency Score: {Math.round(signals.recency_score)}%
                    </p>
                </Card>

                {/* Evidence Coverage */}
                <Card className="text-center relative overflow-hidden group">
                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 text-slate-400 group-hover:text-white transition-colors">
                        <FileText size={14} />
                    </div>
                    <p className="text-3xl font-bold text-white mt-2">{Math.round(signals.evidenceCoverage)}%</p>
                    <p className="text-xs text-slate-500 mt-1">Evidence Coverage</p>
                    <div className="mt-3 w-full h-1.5 bg-void-950/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan rounded-full transition-all duration-500"
                            style={{ width: `${signals.evidenceCoverage}%`, boxShadow: "0 0 10px rgba(6, 182, 212, 0.4)" }}
                        />
                    </div>
                </Card>
            </div>

            {/* Market Status Banner */}
            <Card className={`${signals.marketEstablished ? 'border-amber-500/30 bg-amber-500/5' : 'border-cyan/30 bg-cyan/5'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${signals.marketEstablished ? 'bg-amber-500/20' : 'bg-cyan/20'}`}>
                        {signals.marketEstablished ? (
                            <Activity className="text-amber-400" size={24} />
                        ) : (
                            <Zap className="text-cyan" size={24} />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-white">
                            {signals.marketEstablished ? "Established Market" : "Emerging Market"}
                        </p>
                        <p className="text-sm text-slate-400">
                            {signals.marketEstablished
                                ? `Similar features exist with ${competitorCount} known offerings. Differentiation will be key.`
                                : "Limited similar features detected. Opportunity for market entry."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Analysis Notes */}
            {signals.notes && signals.notes.length > 0 && (
                <div className="space-y-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Analysis Notes</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        {signals.notes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-void-800/50 border border-white/5 rounded-xl hover:bg-void-800 transition-colors">
                                <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-300 leading-relaxed">{note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
