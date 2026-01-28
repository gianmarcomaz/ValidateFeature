"use client";

import { motion } from "framer-motion";

export function LightWave() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-void-950" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-void-950 via-void-900 to-void-800 opacity-80" />

            {/* Glowing Orbs for ambient light */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]"
            />
            <motion.div
                animate={{
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1.2, 1, 1.2],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-cyan/10 rounded-full blur-[120px]"
            />

            {/* The Wave */}
            <div className="absolute bottom-0 left-0 w-full h-[50vh] opacity-60">
                <svg
                    className="w-full h-full"
                    viewBox="0 0 1440 320"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <motion.path
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="2"
                        d="M0,160 C320,300, 420,0, 1440,220"
                        animate={{
                            d: [
                                "M0,160 C320,300, 720,0, 1440,220",
                                "M0,160 C320,100, 720,280, 1440,220",
                                "M0,160 C320,300, 720,0, 1440,220"
                            ],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        style={{ filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))" }}
                    />
                    <motion.path
                        fill="none"
                        stroke="url(#gradient2)"
                        strokeWidth="3"
                        d="M0,190 C320,320, 620,120, 1440,220"
                        animate={{
                            d: [
                                "M0,190 C320,320, 620,120, 1440,220",
                                "M0,190 C320,120, 620,320, 1440,220",
                                "M0,190 C320,320, 620,120, 1440,220"
                            ],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        style={{ filter: "drop-shadow(0 0 15px rgba(6, 182, 212, 0.4))" }}
                    />
                    <motion.path
                        fill="none"
                        stroke="url(#gradient1)"
                        strokeWidth="1"
                        opacity="0.5"
                        d="M0,220 C320,350, 920,50, 1440,220"
                        animate={{
                            d: [
                                "M0,220 C320,350, 920,50, 1440,220",
                                "M0,220 C320,150, 920,350, 1440,220",
                                "M0,220 C320,350, 920,50, 1440,220"
                            ],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    <defs>
                        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                            <stop offset="20%" stopColor="#8b5cf6" stopOpacity="1" />
                            <stop offset="80%" stopColor="#c4b5fd" stopOpacity="1" />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                            <stop offset="20%" stopColor="#06b6d4" stopOpacity="1" />
                            <stop offset="80%" stopColor="#67e8f9" stopOpacity="1" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}
