"use client";

import { Card } from "@/components/ui/Card";
import { MessageSquare, ArrowUp, ExternalLink, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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
            <div className="space-y-4 animate-fade-in">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Community Signals</h2>
                    <p className="text-sm text-slate-400">Discussions and trends from developer communities</p>
                </div>
                <div className="text-center py-12 bg-void-900/50 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-void-800 flex items-center justify-center border border-white/5">
                        <MessageSquare className="text-slate-600" size={24} />
                    </div>
                    <p className="text-slate-400 font-medium">No community discussions found</p>
                    <p className="text-xs text-slate-500 mt-1">This could indicate an untapped opportunity or niche market.</p>
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
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} wks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} mos ago`;
        return `${Math.floor(diffDays / 365)} yrs ago`;
    };

    const getEngagementLevel = (points?: number, comments?: number) => {
        const total = (points || 0) + (comments || 0) * 2;
        if (total >= 100) return { label: "High", color: "text-cyan bg-cyan/10 border-cyan/20" };
        if (total >= 30) return { label: "Medium", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        return { label: "Low", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    };

    // Sort by engagement
    const sortedHits = [...hackerNewsHits].sort((a, b) => {
        const aScore = (a.points || 0) + (a.num_comments || 0) * 2;
        const bScore = (b.points || 0) + (b.num_comments || 0) * 2;
        return bScore - aScore;
    });

    const topHits = sortedHits.slice(0, 5);
    const chartData = topHits.map(hit => ({
        name: hit.title.substring(0, 15) + "...",
        engagement: (hit.points || 0) + (hit.num_comments || 0) * 2,
        points: hit.points || 0,
        comments: hit.num_comments || 0,
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-void-900 border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                    <p className="text-white font-medium text-xs mb-2">{label}</p>
                    <p className="text-cyan text-xs">Engagement: {payload[0].value}</p>
                    <p className="text-slate-400 text-xs">Points: {payload[0].payload.points}</p>
                    <p className="text-slate-400 text-xs">Comments: {payload[0].payload.comments}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Community Trends</h2>
                    <p className="text-sm text-slate-400">
                        Analysis of {hackerNewsHits.length} relevant discussions
                    </p>
                </div>
                {recencyScore !== undefined && (
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Recency Score</p>
                        <div className={`text-lg font-bold px-3 py-1 rounded-lg border ${recencyScore >= 60 ? 'text-cyan border-cyan/30 bg-cyan/10' : recencyScore >= 30 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-slate-400 border-slate-600/30 bg-slate-600/10'}`}>
                            {Math.round(recencyScore)}%
                        </div>
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <Card className="lg:col-span-1 min-h-[300px] flex flex-col justify-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-6">Top Engagement</p>
                    <div className="w-full h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="engagement" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#barGradient-${index})`} />
                                    ))}
                                </Bar>
                                <defs>
                                    {chartData.map((_, index) => (
                                        <linearGradient key={`barGradient-${index}`} id={`barGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        </linearGradient>
                                    ))}
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Discussions List */}
                <div className="lg:col-span-2 space-y-3">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Recent Discussions</p>
                    {sortedHits.slice(0, 6).map((hit, index) => {
                        const engagement = getEngagementLevel(hit.points, hit.num_comments);

                        return (
                            <a
                                key={hit.objectID || index}
                                href={hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-void-900/40 border border-white/5 rounded-xl hover:border-cyan/30 hover:bg-void-800/60 transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-slate-200 group-hover:text-cyan transition-colors line-clamp-1">
                                            {hit.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(hit.created_at)}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="flex items-center gap-1">
                                                <ArrowUp size={12} />
                                                {hit.points || 0}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare size={12} />
                                                {hit.num_comments || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${engagement.color}`}>
                                            {engagement.label}
                                        </span>
                                        <ExternalLink size={14} className="text-slate-600 group-hover:text-cyan transition-colors" />
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
