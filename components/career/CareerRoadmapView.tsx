"use client";

import { useState } from "react";

/**
 * CareerRoadmapView — a client component rendering an interactive, step-by-step
 * career trajectory from Grade 12 through UMP to a career destination.
 *
 * Deliberately NOT a real graph library (no d3/react-flow dependency): the
 * roadmap is a vertical timeline with expandable milestone cards. This keeps
 * the bundle tiny, works without JS for the initial paint (CSS only hover
 * states), and avoids an npm package whose semver can drift.
 *
 * Data flows in as a typed array of RoadmapStep, so this component is
 * reusable for any career path -- not hardcoded to any particular UMP programme.
 */

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

const PHASE_STYLES: Record<
  RoadmapStep["phase"],
  { dot: string; badge: string; label: string }
> = {
  school: {
    dot: "bg-brand-amber border-brand-amber/30",
    badge: "bg-brand-amber-soft text-brand-amber border-brand-amber/30",
    label: "School",
  },
  admission: {
    dot: "bg-brand-teal border-brand-teal/30",
    badge: "bg-brand-teal-soft text-brand-teal border-brand-teal/30",
    label: "Admission",
  },
  degree: {
    dot: "bg-brand-violet border-brand-violet/30",
    badge: "bg-brand-violet-soft text-brand-violet border-brand-violet/30",
    label: "Degree",
  },
  skills: {
    dot: "bg-mark-green border-mark-green/30",
    badge: "bg-mark-green-soft text-mark-green border-mark-green/30",
    label: "Skills",
  },
  work: {
    dot: "bg-brand-coral border-brand-coral/30",
    badge: "bg-brand-coral-soft text-brand-coral border-brand-coral/30",
    label: "Work",
  },
  career: {
    dot: "bg-brand-navy border-brand-navy/30",
    badge: "bg-slate-soft text-ink border-line",
    label: "Career",
  },
};

interface CareerRoadmapViewProps {
  heading: string;
  steps: RoadmapStep[];
}

export function CareerRoadmapView({ heading, steps }: CareerRoadmapViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(steps[0]?.id ?? null);

  return (
    <section aria-label={heading} className="flex flex-col gap-2">
      <h2 className="text-xl font-bold tracking-tight text-ink mb-4">{heading}</h2>
      <ol className="relative flex flex-col gap-0 list-none">
        {/* Vertical timeline line */}
        <div
          aria-hidden
          className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-line"
        />

        {steps.map((step, index) => {
          const style = PHASE_STYLES[step.phase];
          const isExpanded = expandedId === step.id;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className={`relative flex gap-4 ${isLast ? "" : "pb-4"}`}>
              {/* Timeline dot */}
              <div
                aria-hidden
                className={`relative z-10 flex-none size-10 rounded-full border-2 ${style.dot} flex items-center justify-center shadow-sm`}
              >
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>

              {/* Card */}
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : step.id)}
                  aria-expanded={isExpanded}
                  className="w-full text-left rounded-xl card-learner p-4 transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-teal"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                        >
                          {style.label}
                        </span>
                        {step.duration && (
                          <span className="text-xs text-ink-faint">{step.duration}</span>
                        )}
                      </div>
                      <p className="font-bold text-ink leading-snug">{step.title}</p>
                      <p className="text-xs text-ink-soft">{step.subtitle}</p>
                    </div>
                    <span
                      aria-hidden
                      className={`flex-none text-ink-faint text-lg transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                    >
                      ›
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && step.bullets && step.bullets.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-sm text-ink-soft">
                      {step.bullets.map((bullet, bi) => (
                        <li key={bi} className="flex items-start gap-2">
                          <span className="mt-1 size-1.5 flex-none rounded-full bg-brand-teal" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>

                {/* External CTA below card, only when expanded */}
                {isExpanded && step.ctaLabel && step.ctaHref && (
                  <a
                    href={step.ctaHref}
                    target={step.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel={step.ctaHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-2 ml-4 inline-flex items-center gap-1 text-xs font-bold text-brand-teal hover:underline"
                  >
                    {step.ctaLabel} →
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
