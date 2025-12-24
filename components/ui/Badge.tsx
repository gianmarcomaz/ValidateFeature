import React from "react";
import { Verdict, Confidence } from "@/lib/domain/types";

interface BadgeProps {
  verdict?: Verdict;
  confidence?: Confidence;
  children?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md" | "lg";
}

export function Badge({ 
  verdict, 
  confidence, 
  children, 
  variant,
  size = "md" 
}: BadgeProps) {
  let bgColor = "bg-gray-100 text-gray-800";
  let textColor = "text-gray-800";
  
  if (verdict) {
    switch (verdict) {
      case "BUILD":
        bgColor = "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-400/50";
        textColor = "text-white";
        break;
      case "RISKY":
        bgColor = "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-2 border-yellow-300/50";
        textColor = "text-white";
        break;
      case "DONT_BUILD":
        bgColor = "bg-gradient-to-r from-red-500 to-rose-600 text-white border-2 border-red-400/50";
        textColor = "text-white";
        break;
    }
  } else if (variant) {
    switch (variant) {
      case "success":
        bgColor = "bg-green-100 text-green-800";
        textColor = "text-green-800";
        break;
      case "warning":
        bgColor = "bg-yellow-100 text-yellow-800";
        textColor = "text-yellow-800";
        break;
      case "danger":
        bgColor = "bg-red-100 text-red-800";
        textColor = "text-red-800";
        break;
      case "neutral":
        bgColor = "bg-gray-100 text-gray-800";
        textColor = "text-gray-800";
        break;
    }
  }

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-lg font-bold shadow-lg",
  };

  const displayText = verdict ? verdict.replace("_", " ") : (children || "");
  const confidenceBadge = confidence && verdict && (
    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getConfidenceColor(confidence)}`}>
      {confidence}
    </span>
  );

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${bgColor} ${sizeClasses[size]} transition-all duration-300`}>
      {displayText}
      {confidenceBadge}
    </span>
  );
}

function getConfidenceColor(confidence: Confidence): string {
  switch (confidence) {
    case "HIGH":
      return "bg-green-100/90 text-green-800 font-semibold";
    case "MEDIUM":
      return "bg-yellow-100/90 text-yellow-800 font-semibold";
    case "LOW":
      return "bg-red-100/90 text-red-800 font-semibold";
  }
}

