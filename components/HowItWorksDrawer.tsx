"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Search, ShieldCheck, Rocket } from "lucide-react";

interface HowItWorksDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HowItWorksDrawer({ isOpen, onClose }: HowItWorksDrawerProps) {
    const features = [
        {
            icon: Zap,
            title: "Speed",
            heading: "Lightning-Fast Intelligence",
            description: "Input your feature idea and get actionable signals in seconds, not weeks.",
            color: "from-yellow-400 to-orange-500",
        },
        {
            icon: Search,
            title: "Transparency",
            heading: "Glass-Box Analysis",
            description: "We don't just give a score; we show you the raw Reddit discussions, Google trends, and competitor moves driving the verdict.",
            color: "from-cyan-400 to-blue-500",
        },
        {
            icon: ShieldCheck,
            title: "Trust",
            heading: "Founder-Verified Logic",
            description: "Receive an unbiased Build/Risky/Don't Build decision backed by real-world market evidence.",
            color: "from-green-400 to-emerald-500",
        },
        {
            icon: Rocket,
            title: "Optimization",
            heading: "Roadmap Mastery",
            description: "Stop wasting engineering sprints on low-impact features. Ship only what moves the needle.",
            color: "from-purple-400 to-pink-500",
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-void-950 border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-void-950/95 backdrop-blur-lg border-b border-white/5 p-6 z-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white">How It Works</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                AI-powered feature validation in 4 simple steps
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative p-6 bg-void-900/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300"
                                >
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                                        }}
                                    />

                                    {/* Icon */}
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                            <feature.icon className="text-white" size={24} />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-2">
                                                {feature.heading}
                                            </h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Step number */}
                                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                        <span className="text-xs font-bold text-slate-500">
                                            {index + 1}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Footer CTA */}
                        <div className="sticky bottom-0 bg-void-950/95 backdrop-blur-lg border-t border-white/5 p-6">
                            <button
                                onClick={onClose}
                                className="w-full px-6 py-3 bg-gradient-to-r from-accent to-purple-600 text-white rounded-xl font-medium hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
                            >
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
