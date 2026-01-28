"use client";

import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Globe,
    Users,
    FileText,
    ArrowLeft,
    Zap
} from "lucide-react";
import Link from "next/link";

interface DashboardSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    title?: string;
}

export function DashboardSidebar({ activeTab, setActiveTab, title }: DashboardSidebarProps) {
    const menuItems = [
        { id: "verdict", label: "Verdict", icon: Zap },
        { id: "market", label: "Market Overview", icon: LayoutDashboard },
        { id: "competitors", label: "Competitors", icon: Users },
        { id: "evidence", label: "Evidence", icon: FileText },
    ];

    return (
        <div className="w-64 h-screen fixed left-0 top-0 bg-void-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-xs uppercase tracking-wider"
                >
                    <ArrowLeft size={14} />
                    Back home
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                        <Globe className="text-white" size={18} />
                    </div>
                    <h1 className="font-bold text-white text-lg tracking-tight">VALIDATE</h1>
                </div>
                {title && (
                    <p className="mt-4 text-sm text-slate-400 line-clamp-2">
                        {title}
                    </p>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1">
                <p className="px-3 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Analysis
                </p>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? "text-white bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full"
                                />
                            )}
                            <item.icon size={18} className={isActive ? "text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "group-hover:text-white transition-colors"} />
                            <span className="font-medium">{item.label}</span>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        </button>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-void-900 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-dark to-cyan flex items-center justify-center text-xs font-bold text-white">
                        P
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">Pro Plan</p>
                        <p className="text-xs text-slate-500 truncate">Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
