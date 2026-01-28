"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LightWave } from "@/components/ui/LightWave";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-void-950 overflow-hidden selection:bg-accent/30 selection:text-white">
      <LightWave />

      {/* Navigation */}
      <nav className="relative z-50 w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Zap className="text-white" size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">VALIDATE</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="/new" className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-[85vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-white drop-shadow-2xl">
            Clarity. Focus. <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-purple-400 to-cyan animate-text">Impact.</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            We turn potential ideas into <span className="text-white font-medium">validated products</span> through AI-driven market intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/new"
              className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
            >
              Start Validating
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#demo"
              className="px-8 py-4 rounded-full border border-white/20 text-white font-medium backdrop-blur-md hover:bg-white/10 transition-all duration-300"
            >
              View Demo
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Stats/Social Proof */}
      <div className="relative z-10 border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Market Signals", value: "24/7" },
              { label: "Analysis Time", value: "< 2 min" },
              { label: "Data Sources", value: "50M+" },
              { label: "Confidence", value: "High" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </main>
  );
}
