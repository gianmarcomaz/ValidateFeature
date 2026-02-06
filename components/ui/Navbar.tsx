"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { HowItWorksDrawer } from "@/components/HowItWorksDrawer";

export function Navbar() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 bg-void-950/80 backdrop-blur-lg border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300">
                            <Zap className="text-white" size={18} fill="currentColor" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-accent transition-colors">
                            VALIDATE
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="text-sm text-slate-400 hover:text-white transition-colors"
                        >
                            How It Works
                        </button>
                        <Link
                            href="/new"
                            className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                        >
                            New Validation
                        </Link>
                    </div>
                </div>
            </nav>

            {/* How It Works Drawer */}
            <HowItWorksDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
}
