import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "md", className }: BadgeProps) {
  const variantStyles = {
    success: "bg-teal/15 text-teal border-teal/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/15 text-red-400 border-red-500/30",
    neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2 font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Verdict-specific badge component
interface VerdictBadgeProps {
  verdict: "BUILD" | "RISKY" | "DONT_BUILD";
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const config = {
    BUILD: {
      label: "Build It",
      variant: "success" as const,
    },
    RISKY: {
      label: "Risky",
      variant: "warning" as const,
    },
    DONT_BUILD: {
      label: "Don't Build",
      variant: "danger" as const,
    },
  };

  const { label, variant } = config[verdict];

  return (
    <Badge variant={variant} size="lg" className={className}>
      {label}
    </Badge>
  );
}

// Confidence badge
interface ConfidenceBadgeProps {
  confidence: "HIGH" | "MEDIUM" | "LOW";
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const config = {
    HIGH: { label: "High Confidence", variant: "success" as const },
    MEDIUM: { label: "Medium Confidence", variant: "warning" as const },
    LOW: { label: "Low Confidence", variant: "danger" as const },
  };

  const { label, variant } = config[confidence];

  return (
    <Badge variant={variant} size="sm" className={className}>
      {label}
    </Badge>
  );
}
