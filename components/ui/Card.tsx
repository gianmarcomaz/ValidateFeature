import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "default" | "elevated";
}

export function Card({ children, className, hover = false, variant = "default" }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        variant === "default" && "bg-navy-800/80 border border-slate-700/50",
        variant === "elevated" && "bg-navy-700/80 border border-slate-600/50",
        hover && "transition-all duration-300 hover:border-slate-600 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("pb-4", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}
