"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMotionConfig } from "@/lib/motion";

export default function Home() {
  const { reduceMotion, fadeUp, staggerContainer: stagger } = useMotionConfig();

  return (
    <main className="relative min-h-screen">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,212,191,0.08)_0%,_transparent_50%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Hero Section */}
        <motion.section
          className="pt-32 pb-24 text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            className="text-accent font-medium mb-4 tracking-wide uppercase text-sm"
            variants={fadeUp}
          >
            Feature Validation Platform
          </motion.p>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
            variants={fadeUp}
          >
            Validate your ideas<br />
            <span className="text-slate-400">before you build</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            variants={fadeUp}
          >
            Get instant verdicts backed by real market evidence.
            Stop wasting time on features nobody wants.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4"
            variants={fadeUp}
          >
            <Link href="/new" className="btn-primary text-base px-8 py-4">
              Start Validating
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-base px-8 py-4">
              Learn More
            </Link>
          </motion.div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          className="py-24"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-16">
            <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Three steps to clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-5">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Describe your feature
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tell us about the feature you want to build and who you're building it for.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-5">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                We gather evidence
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our AI analyzes market signals, competitors, and user pain points from real data.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              className="card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold mb-5">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Get your verdict
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Receive a clear recommendation with transparent reasoning and next steps.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="py-24 border-t border-slate-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-medium mb-3 text-sm uppercase tracking-wide">Evidence-Based</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Decisions backed by data, not guesswork
              </h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Every verdict comes with transparent evidence and methodology.
                See exactly what signals we found and how they influenced the recommendation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Competitor analysis from real market data</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Community sentiment from forums and discussions</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Clear methodology and assumptions disclosed</span>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Market Demand</span>
                    <span className="text-white font-medium">78%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '78%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Competition Level</span>
                    <span className="text-white font-medium">45%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Pain Signal Strength</span>
                    <span className="text-white font-medium">82%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '82%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-24 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to validate your next idea?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Stop building features that fail. Get evidence-backed verdicts in minutes.
          </p>
          <Link href="/new" className="btn-primary text-lg px-10 py-5">
            Get Started Free
          </Link>
        </motion.section>
      </div>
    </main>
  );
}
