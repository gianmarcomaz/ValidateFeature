"use client";

import { Card } from "@/components/ui/Card";

interface HackerNewsHit {
    title: string;
    url?: string;
    points?: number;
    num_comments?: number;
    created_at?: string;
    objectID: string;
}

interface MarketTrendsProps {
    hackerNewsHits: HackerNewsHit[];
    recencyScore?: number;
}

export function MarketTrends({ hackerNewsHits, recencyScore }: MarketTrendsProps) {
    if (!hackerNewsHits || hackerNewsHits.length === 0) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Community Signals</h2>
                    <p className="text-sm text-slate-400">Discussions and trends from developer communities</p>
                </div>
                <div className="text-center py-12 bg-navy-800/50 rounded-xl border border-slate-700/50">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-slate-400">No community discussions found</p>
                    <p className="text-xs text-slate-500 mt-1">This could indicate an untapped opportunity</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "Unknown date";
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    const getEngagementLevel = (points?: number, comments?: number) => {
        const total = (points || 0) + (comments || 0) * 2;
        if (total >= 100) return { label: "High", color: "text-teal bg-teal/10" };
        if (total >= 30) return { label: "Medium", color: "text-amber-400 bg-amber-500/10" };
        return { label: "Low", color: "text-slate-400 bg-slate-500/10" };
    };

    // Sort by engagement
    const sortedHits = [...hackerNewsHits].sort((a, b) => {
        const aScore = (a.points || 0) + (a.num_comments || 0) * 2;
        const bScore = (b.points || 0) + (b.num_comments || 0) * 2;
        return bScore - aScore;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Community Signals</h2>
                    <p className="text-sm text-slate-400">
                        {hackerNewsHits.length} discussions found on Hacker News
                    </p>
                </div>
                {recencyScore !== undefined && (
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Recency Score</p>
                        <p className={`text-lg font-bold ${recencyScore >= 60 ? 'text-teal' : recencyScore >= 30 ? 'text-amber-400' : 'text-slate-400'}`}>
                            {Math.round(recencyScore)}%
                        </p>
                    </div>
                )}
            </div>

            {/* Trend Summary */}
            <Card className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                </div>
                <div>
                    <p className="font-medium text-white">
                        {sortedHits.length > 3 ? "Active Discussion Topic" : "Moderate Interest"}
                    </p>
                    <p className="text-sm text-slate-400">
                        {sortedHits.reduce((sum, h) => sum + (h.points || 0), 0)} total upvotes •
                        {" "}{sortedHits.reduce((sum, h) => sum + (h.num_comments || 0), 0)} total comments
                    </p>
                </div>
            </Card>

            {/* Discussions List */}
            <div className="space-y-3">
                {sortedHits.slice(0, 8).map((hit, index) => {
                    const engagement = getEngagementLevel(hit.points, hit.num_comments);

                    return (
                        <a
                            key={hit.objectID || index}
                            href={hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-navy-800/60 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all duration-200 group"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="font-medium text-white group-hover:text-accent transition-colors line-clamp-2">
                                        {hit.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                        <span>{formatDate(hit.created_at)}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 15.172l-6.364 3.35 1.216-7.086L.293 6.964l7.106-1.032L10 0l2.6 5.932 7.107 1.032-4.559 4.472 1.216 7.086L10 15.172z" />
                                            </svg>
                                            {hit.points || 0}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            {hit.num_comments || 0}
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${engagement.color}`}>
                                    {engagement.label}
                                </span>
                            </div>
                        </a>
                    );
                })}
            </div>

            {/* View on HN link */}
            <div className="text-center">
                <a
                    href="https://news.ycombinator.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                    View more on Hacker News →
                </a>
            </div>
        </div>
    );
}
