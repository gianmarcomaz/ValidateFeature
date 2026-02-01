"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";

interface Citation {
    source: "google" | "hackernews";
    title: string;
    url: string;
    snippet?: string;
    date?: string;
}

interface GoogleQuery {
    q: string;
    items: Array<{
        title: string;
        snippet: string;
        link: string;
        displayLink?: string;
    }>;
}

interface EvidenceSourcesProps {
    citations: Citation[];
    googleQueries?: GoogleQuery[];
    hackerNewsHits?: Array<{
        title: string;
        url?: string;
        points?: number;
        num_comments?: number;
        created_at?: string;
        objectID: string;
    }>;
}

export function EvidenceSources({ citations, googleQueries, hackerNewsHits }: EvidenceSourcesProps) {
    const [activeTab, setActiveTab] = useState<"all" | "google" | "hackernews">("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter citations by source and search
    const filteredCitations = citations.filter(citation => {
        const matchesTab = activeTab === "all" || citation.source === activeTab;
        const matchesSearch = searchQuery === "" ||
            citation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            citation.snippet?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const googleCount = citations.filter(c => c.source === "google").length;
    const hnCount = citations.filter(c => c.source === "hackernews").length;

    if (citations.length === 0) {
        return (
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-1">Evidence Sources</h2>
                    <p className="text-sm text-slate-400">All sources used for the analysis</p>
                </div>
                <div className="text-center py-12 bg-navy-800/50 rounded-xl border border-slate-700/50">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-slate-400">No evidence sources available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-1">Evidence Sources</h2>
                <p className="text-sm text-slate-400">
                    {citations.length} sources analyzed from search results and community discussions
                </p>
            </div>

            {/* Tabs and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "all"
                            ? "bg-accent/20 text-accent border border-accent/30"
                            : "bg-navy-800 text-slate-400 border border-slate-700/50 hover:text-white"
                            }`}
                    >
                        All ({citations.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("google")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "google"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-navy-800 text-slate-400 border border-slate-700/50 hover:text-white"
                            }`}
                    >
                        Search ({googleCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("hackernews")}
                        className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === "hackernews"
                            ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                            : "bg-navy-800 text-slate-400 border border-slate-700/50 hover:text-white"
                            }`}
                    >
                        HN ({hnCount})
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search sources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 px-4 py-2 pl-10 bg-navy-800 border border-slate-700/50 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent/50"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Search Queries Used (collapsible) */}
            {googleQueries && googleQueries.length > 0 && (
                <details className="group">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm text-slate-400 hover:text-white">
                        <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        View {googleQueries.length} search queries used
                    </summary>
                    <div className="mt-3 p-4 bg-navy-900 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                            {googleQueries.map((qr, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg">
                                    &quot;{qr.q}&quot; → {qr.items.length} results
                                </span>
                            ))}
                        </div>
                    </div>
                </details>
            )}

            {/* Citations List */}
            <div className="space-y-3">
                {filteredCitations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No sources match your search
                    </div>
                ) : (
                    filteredCitations.map((citation, index) => (
                        <a
                            key={index}
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-navy-800/60 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all duration-200 group"
                        >
                            <div className="flex items-start gap-3">
                                {/* Source Icon */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${citation.source === "google" ? "bg-blue-500/10" : "bg-orange-500/10"
                                    }`}>
                                    {citation.source === "google" ? (
                                        <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-3.166 5.946-3.179-5.946H6.951z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-white group-hover:text-accent transition-colors line-clamp-1">
                                        {citation.title}
                                    </h3>
                                    {citation.snippet && (
                                        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                            {citation.snippet}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                        <span className="truncate max-w-[200px]">{new URL(citation.url).hostname}</span>
                                        {citation.date && (
                                            <>
                                                <span>•</span>
                                                <span>{citation.date}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Arrow */}
                                <svg className="w-4 h-4 text-slate-600 group-hover:text-accent transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                        </a>
                    ))
                )}
            </div>

            {/* Load More */}
            {filteredCitations.length > 10 && (
                <div className="text-center">
                    <button className="text-xs text-slate-500 hover:text-white transition-colors">
                        Load more sources...
                    </button>
                </div>
            )}
        </div>
    );
}
