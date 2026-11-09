"use client";

import { useState } from "react";

export interface RoadmapStep {
  id: string;
  phase: "school" | "admission" | "degree" | "skills" | "work" | "career";
  title: string;
  subtitle: string;
  duration?: string;
  bullets?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

const PHASE_STYLES: Record<RoadmapStep["phase"], { dot: string; badge: string; label: string }> = {
  school: { dot: "bg-brand-amber border-brand-amber/30", badge: "bg-brand-amber/10 text-brand-amber", label: "School" },
  admission: { dot: "bg-brand-teal border-brand-teal/30", badge: "bg-brand-teal/10 text-brand-teal", label: "Admission" },
  degree: { dot: "bg-brand-violet border-brand-violet/30", badge: "bg-brand-violet/10 text-brand-violet", label: "Degree" },
  skills: { dot: "bg-mark-green border-mark-green/30", badge: "bg-mark-green/10 text-mark-green", label: "Skills" },
  work: { dot: "bg-brand-coral border-brand-coral/30", badge: "bg-brand-coral/10 text-brand-coral", label: "Work" },
  career: { dot: "bg-brand-navy border-brand-navy/30", badge: "bg-slate-soft text-ink", label: "Career" },
};

export function CareerRoadmapView({ heading, steps }: { heading: string; steps: RoadmapStep[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(steps[0]?.id ?? null);

  return (
    <section aria-label={heading} className="flex flex-col gap-4 rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy/10 text-xl text-ink">🗺️</span>
        <h2 className="font-display text-2xl font-black text-ink">{heading}</h2>
      </div>
      <ol className="relative mt-4 flex list-none flex-col gap-0">
        <div aria-hidden className="absolute bottom-5 left-[23px] top-5 w-0.5 bg-line/70" />

        {steps.map((step, index) => {
          const style = PHASE_STYLES[step.phase];
          const isExpanded = expandedId === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className={`relative flex gap-5 ${isLast ? "" : "pb-6"}`}>
              <div aria-hidden className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 shadow-sm ${style.dot}`}>
                <span className="text-sm font-black text-white">{index + 1}</span>
              </div>

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : step.id)}
                  aria-expanded={isExpanded}
                  className="w-full rounded-2xl border border-line/60 bg-paper-raised p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${style.badge}`}>
                          {style.label}
                        </span>
                        {step.duration && <span className="text-xs font-bold text-ink-faint">{step.duration}</span>}
                      </div>
                      <p className="font-display text-lg font-bold text-ink">{step.title}</p>
                      <p className="text-sm font-medium leading-relaxed text-ink-soft">{step.subtitle}</p>
                    </div>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-soft text-ink-soft transition-transform duration-300 ${isExpanded ? "rotate-180 bg-brand-teal/10 text-brand-teal" : ""}`}>
                      ▼
                    </div>
                  </div>

                  {isExpanded && step.bullets && step.bullets.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-2 border-t border-line/50 pt-4 text-sm font-medium text-ink-soft">
                      {step.bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-start gap-3">
                          <span className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-brand-teal" />
                          <span className="leading-relaxed">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </button>

                {isExpanded && step.ctaLabel && step.ctaHref && (
                  <a
                    href={step.ctaHref}
                    target={step.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel={step.ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-3 ml-2 inline-flex items-center gap-2 rounded-xl bg-brand-teal/10 px-4 py-2 text-xs font-bold text-brand-teal transition-colors hover:bg-brand-teal/20"
                  >
                    {step.ctaLabel} ↗
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}