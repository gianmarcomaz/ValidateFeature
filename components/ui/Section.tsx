import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-10">
      {title && (
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
