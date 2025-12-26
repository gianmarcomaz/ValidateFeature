import React from "react";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Section({ title, children, className = "" }: SectionProps) {
  return (
    <section className={`mb-8 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-slate-100 mb-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

