"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

interface ProgressStepperProps {
    stage?: string;
    className?: string;
}

const STAGES = [
    { id: "processing", label: "Saved" },
    { id: "normalizing", label: "Analyzing" },
    { id: "evidence", label: "Evidence" },
    { id: "verdict", label: "Verdict" },
    { id: "complete", label: "Complete" },
] as const;

type StageId = typeof STAGES[number]["id"];

function getStageIndex(stage: string | undefined): number {
    if (!stage) return 0;
    const idx = STAGES.findIndex(s => s.id === stage);
    return idx >= 0 ? idx : 0;
}

export function ProgressStepper({ stage, className = "" }: ProgressStepperProps) {
    const currentIndex = getStageIndex(stage);
    const isPartial = stage === "partial";
    const isComplete = stage === "complete";

    return (
        <div className={`w-full ${className}`}>
            {/* Progress bar background */}
            <div className="relative flex items-center justify-between mb-2">
                {/* Connecting line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-void-700 -translate-y-1/2 z-0" />

                {/* Progress fill */}
                <motion.div
                    className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-teal to-accent -translate-y-1/2 z-0"
                    initial={{ width: "0%" }}
                    animate={{
                        width: isComplete ? "100%" : `${(currentIndex / (STAGES.length - 1)) * 100}%`
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />

                {/* Step indicators */}
                {STAGES.map((stageItem, index) => {
                    const isPast = index < currentIndex;
                    const isCurrent = index === currentIndex && !isComplete;
                    const isCompleted = isComplete || isPast;

                    return (
                        <div key={stageItem.id} className="relative z-10 flex flex-col items-center">
                            <motion.div
                                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-colors duration-300 border-2
                  ${isCompleted
                                        ? "bg-teal border-teal text-void-950"
                                        : isCurrent
                                            ? "bg-void-800 border-teal text-teal"
                                            : "bg-void-800 border-void-600 text-slate-500"
                                    }
                `}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: isCurrent ? 1.1 : 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isCompleted ? (
                                    <Check size={16} />
                                ) : isCurrent ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between">
                {STAGES.map((stageItem, index) => {
                    const isCurrent = index === currentIndex && !isComplete;
                    const isPast = index < currentIndex || isComplete;

                    return (
                        <span
                            key={stageItem.id}
                            className={`text-xs font-medium transition-colors ${isCurrent
                                ? "text-teal"
                                : isPast
                                    ? "text-slate-400"
                                    : "text-slate-600"
                                }`}
                            style={{ width: "20%", textAlign: "center" }}
                        >
                            {stageItem.label}
                        </span>
                    );
                })}
            </div>

            {/* Status message */}
            {isPartial && (
                <motion.p
                    className="text-center text-amber-400 text-sm mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    Processing completed with partial results
                </motion.p>
            )}

            {!isComplete && !isPartial && stage && (
                <motion.p
                    className="text-center text-slate-400 text-sm mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {stage === "processing" && "Initializing feature validation..."}
                    {stage === "normalizing" && "Analyzing feature concept..."}
                    {stage === "evidence" && "Gathering market signals..."}
                    {stage === "verdict" && "Evaluating feature viability..."}
                </motion.p>
            )}
        </div>
    );
}
