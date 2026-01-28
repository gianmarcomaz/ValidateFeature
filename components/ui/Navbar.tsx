"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-md border-b border-slate-800/50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-semibold text-white text-lg">Validate</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
                            How It Works
                        </Link>
                        <Link href="/new" className="text-sm text-slate-400 hover:text-white transition-colors">
                            New Validation
                        </Link>
                    </div>

                    {/* CTA Button */}
                    <Link href="/new" className="btn-primary text-sm py-2 px-5">
                        Get Started
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
