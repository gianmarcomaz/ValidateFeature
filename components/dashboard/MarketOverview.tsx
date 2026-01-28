"use client";

import { Card } from "@/components/ui/Card";

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
        return { label: "Low", color: "text-teal", bgColor: "bg-teal/20", dots: 1 };
    };

    const getRecencyLabel = (score: number) => {
        if (score >= 70) return { label: "Very Active", color: "text-teal" };
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
                    Analysis based on {competitorCount} competitors and real-time market signals
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Competitors Found */}
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{competitorCount}</p>
                    <p className="text-xs text-slate-500 mt-1">Competitors Found</p>
                    <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs ${saturation.bgColor} ${saturation.color}`}>
                        {saturation.label} Saturation
                    </div>
                </Card>

                {/* Pain Signal */}
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{Math.round(signals.pain_signal)}%</p>
                    <p className="text-xs text-slate-500 mt-1">Pain Signal</p>
                    <div className="mt-2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${signals.pain_signal}%`,
                                background: "linear-gradient(90deg, #ff6b4a 0%, #2dd4bf 100%)"
                            }}
                        />
                    </div>
                </Card>

                {/* Market Activity */}
                <Card className="text-center">
                    <p className={`text-3xl font-bold ${recency.color}`}>{recency.label}</p>
                    <p className="text-xs text-slate-500 mt-1">Market Activity</p>
                    <p className="text-xs text-slate-600 mt-2">
                        Recency Score: {Math.round(signals.recency_score)}%
                    </p>
                </Card>

                {/* Evidence Coverage */}
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">{Math.round(signals.evidenceCoverage)}%</p>
                    <p className="text-xs text-slate-500 mt-1">Evidence Coverage</p>
                    <div className="mt-2 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal rounded-full transition-all duration-500"
                            style={{ width: `${signals.evidenceCoverage}%` }}
                        />
                    </div>
                </Card>
            </div>

            {/* Market Status Banner */}
            <Card className={`${signals.marketEstablished ? 'border-amber-500/30' : 'border-teal/30'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${signals.marketEstablished ? 'bg-amber-500/20' : 'bg-teal/20'}`}>
                        <svg className={`w-6 h-6 ${signals.marketEstablished ? 'text-amber-400' : 'text-teal'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {signals.marketEstablished ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                        </svg>
                    </div>
                    <div>
                        <p className="font-medium text-white">
                            {signals.marketEstablished ? "Established Market" : "Emerging Market"}
                        </p>
                        <p className="text-sm text-slate-400">
                            {signals.marketEstablished
                                ? `Competition is present with ${competitorCount} known players. Differentiation will be key.`
                                : "Limited competition detected. Opportunity for market entry."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Analysis Notes */}
            {signals.notes && signals.notes.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Analysis Notes</p>
                    <div className="space-y-2">
                        {signals.notes.map((note, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-3 bg-navy-900 rounded-lg">
                                <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-slate-400">{note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
