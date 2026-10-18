"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import { useAuth } from "./auth/AuthProvider";
import { subjectMarksToFormState, type SubjectFormInitialState } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

const STEPS = [
  { number: "01", title: "Explore programmes", detail: "Compare courses, qualifications and institutions.", href: "/programmes", accent: "bg-[#e3f0fa] text-[#2e639c]" },
  { number: "02", title: "Find funding", detail: "Discover bursaries and internships from trusted sources.", href: "/bursaries", accent: "bg-brand-amber-soft text-brand-amber" },
  { number: "03", title: "Plan your next step", detail: "Save your options and prepare to apply.", href: "/account", accent: "bg-brand-coral-soft text-brand-coral" },
];

export function CalculatorPage() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<SubjectMarkInput[]>([]);
  const [initialState, setInitialState] = useState<SubjectFormInitialState | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const { getUserProfile } = await import("@/lib/auth/profile");
      const profile = await getUserProfile(user.uid);
      if (!cancelled && profile?.marks.length) {
        setInitialState(subjectMarksToFormState(profile.marks));
        setFormKey((k) => k + 1);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="w-full bg-paper">
      <section className="hero-atmosphere relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-32 -z-10 size-96 rounded-full bg-brand-teal opacity-25 blur-[1px]" />
        {/* hidden below sm: tuned for the two-column desktop layout's gap;
            on a single-column mobile layout it has no gap to sit in and
            instead sits solidly (opacity-90, unblurred) on top of body
            copy -- found while testing the hero at a real mobile viewport. */}
        <div aria-hidden="true" className="pointer-events-none absolute right-[8%] top-48 -z-10 hidden size-28 rotate-12 rounded-[2rem] bg-brand-amber opacity-90 sm:block" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-text-on-brand">Your future, with a clearer plan</p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find out what <span className="text-[#edc66e]">you can study.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
              Enter your National Senior Certificate subjects and marks. Get a clearer view of the programmes you may qualify for, the ones within reach, and the next steps that make sense for you.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <a href="#calculator-form-title" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-amber px-5 py-3 text-sm font-extrabold text-brand-navy shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Calculate my options <span aria-hidden="true" className="ml-2">→</span>
              </a>
              <span className="text-xs font-semibold text-white/75">Free to start · No account needed</span>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/75">
              <span><span className="mr-2 text-text-on-brand" aria-hidden="true">✓</span>Institution-specific rules</span>
              <span><span className="mr-2 text-text-on-brand" aria-hidden="true">✓</span>Clear eligibility explanations</span>
              <span><span className="mr-2 text-text-on-brand" aria-hidden="true">✓</span>Sources shown where available</span>
            </div>
          </div>

          <div className="card-learner rounded-3xl p-5 text-ink sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-teal">Start here</p>
                <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Start with your marks</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-ink-soft">A guided path from your NSC results to realistic study options.</p>
              </div>
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal-soft text-xl font-black text-brand-teal sm:flex" aria-hidden="true">↗</span>
            </div>
            <ol className="mt-6 space-y-3">
              {[
                ["1", "Add your subjects", "Include your language, Maths, Life Orientation and electives."],
                ["2", "Calculate your APS", "UCAG applies available institution-specific rules."],
                ["3", "Understand your options", "Review matched programmes and the requirements behind each result."],
              ].map(([number, title, detail]) => (
                <li key={number} className="flex gap-3 rounded-2xl border border-line bg-paper p-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy font-display text-sm font-extrabold text-white">{number}</span>
                  <span>
                    <span className="block text-sm font-extrabold text-ink">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-ink-soft">{detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-ink-soft">
              <strong className="text-ink">A note on accuracy:</strong> admissions requirements differ by institution and academic year. Always check the linked official source before applying.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-brand-teal-soft/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-paper-raised text-xl font-black text-brand-teal" aria-hidden="true">✓</span>
            <div>
              <h2 className="text-sm font-extrabold text-ink">Verified where it matters.</h2>
              <p className="mt-1 text-xs leading-5 text-ink-soft">Admissions facts should show their source, verification date and academic year.</p>
            </div>
          </div>
          <Link href="/institutions" className="text-sm font-extrabold text-brand-teal underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
            Explore institutions <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:px-8">
        <div className="min-w-0">
          <div className="mb-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal">Your next step</p>
            <h2 id="calculator-form-title" className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Enter your NSC results</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Use the percentages from your latest results. You can review and change them before calculating.
            </p>
          </div>

          <SubjectForm
            key={formKey}
            onMarksChange={(newMarks) => {
              setMarks(newMarks);
              // Tracking is intentionally best-effort: it must never block
              // the learner's actual results if the analytics endpoint fails.
              fetch("/api/activity/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "calculator_completed" }),
              }).catch(() => {});
            }}
            initialState={initialState}
          />

          {marks.length > 0 && (
            <div className="no-print mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-teal/20 bg-brand-teal-soft/50 p-4">
              <SaveMarksButton marks={marks} />
              <span className="text-xs leading-5 text-ink-soft">
                {marks.length} subjects captured. Your marks stay on this page until you choose to save them.
              </span>
            </div>
          )}
        </div>

        <aside className="no-print hidden lg:sticky lg:top-28 lg:block" aria-label="How UCAG works">
          <div className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-teal">What you will see</p>
            <div className="mt-4 space-y-4">
              {[
                ["✓", "Qualify", "Programmes where the recorded requirements are met."],
                ["≈", "Almost qualify", "The exact APS or subject gap, so you know what needs improving."],
                ["→", "Not yet", "A realistic next pathway instead of a dead end."],
              ].map(([icon, title, detail]) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-soft text-sm font-black text-ink">{icon}</span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-soft">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs leading-5 text-ink-soft">
                <strong className="text-ink">Trust rule:</strong> requirements are institution-specific. If a fact is still being checked, UCAG should say so.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto w-full max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
          <div className="mb-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal">Your journey</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Your next steps, all in one place</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">Move from exploring options to finding funding and preparing to apply.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <Link key={step.number} href={step.href} className="card-learner group flex min-h-52 flex-col p-5 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus">
                <span className={`flex size-12 items-center justify-center rounded-2xl font-display text-base font-extrabold ${step.accent}`}>{step.number}</span>
                <h3 className="mt-5 font-display text-xl font-extrabold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{step.detail}</p>
                <span className="mt-auto pt-5 text-sm font-extrabold text-brand-teal">Explore <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {marks.length > 0 && (
        <section id="results" className="border-t border-line bg-paper">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal">Results</p>
              <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Your study options</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                Read the exact requirement behind each result. There is no single national APS formula, so UCAG keeps the institution&apos;s rule visible.
              </p>
            </div>
            <ResultsSection marks={marks} />
          </div>
        </section>
      )}
    </div>
  );
}
