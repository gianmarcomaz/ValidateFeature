import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Badge({ children, variant = "neutral", size = "md", className }: BadgeProps) {
  const variantStyles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.15)]",
    danger: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.15)]",
    neutral: "bg-slate-500/10 text-slate-400 border-slate-500/20",
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
