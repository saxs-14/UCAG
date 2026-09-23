"use client";

import { useEffect, useState } from "react";
import { SubjectForm } from "./subject-form/SubjectForm";
import { ResultsSection } from "./results/ResultsSection";
import { SaveMarksButton } from "./SaveMarksButton";
import { useAuth } from "./auth/AuthProvider";
import { subjectMarksToFormState, type SubjectFormInitialState } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";

const STEPS = [
  { number: 1, title: "Your subjects", detail: "Choose subjects and enter marks." },
  { number: 2, title: "Your APS", detail: "We apply the institution's rules." },
  { number: 3, title: "Your options", detail: "See qualifying and backup pathways." },
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
      <section className="border-b border-line bg-paper-raised">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal">Start here</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-4xl">
                Find out what you can study.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">
                Enter your NSC marks once. UCAG uses verified institutional rules to show where you qualify,
                where you are close, and what your next pathway can be.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-paper px-4 py-3 text-xs text-ink-soft sm:max-w-xs">
              <strong className="text-ink">No account needed.</strong>
              <span className="ml-1">Sign in only when you want to save your results.</span>
            </div>
          </div>

          <ol className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Calculator steps">
            {STEPS.map((step) => (
              <li key={step.number} className="flex items-center gap-3 rounded-xl border border-line bg-paper p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-xs font-black text-white">
                  {step.number}
                </span>
                <span>
                  <span className="block text-xs font-extrabold text-ink">{step.title}</span>
                  <span className="block text-[11px] leading-4 text-ink-faint">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <section aria-labelledby="calculator-form-title" className="min-w-0">
          <div className="mb-4">
            <h2 id="calculator-form-title" className="text-lg font-black text-ink">Enter your NSC results</h2>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Use percentages from your latest results. You can change them before calculating.
            </p>
          </div>

          <SubjectForm key={formKey} onMarksChange={setMarks} initialState={initialState} />

          {marks.length > 0 && (
            <div className="no-print mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-teal/20 bg-brand-teal-soft/50 p-4">
              <SaveMarksButton marks={marks} />
              <span className="text-[11px] text-ink-soft">
                {marks.length} subjects captured. Your marks stay local until you choose to save them.
              </span>
            </div>
          )}
        </section>

        <aside className="no-print hidden lg:block lg:sticky lg:top-24" aria-label="How UCAG works">
          <div className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-teal">What you will see</p>
            <div className="mt-4 space-y-4">
              {[
                ["✓", "Qualify", "Programmes where the recorded requirements are met."],
                ["≈", "Almost qualify", "The exact APS or subject gap, so you know what needs improving."],
                ["→", "Not yet", "A realistic next pathway instead of a dead end."],
              ].map(([icon, title, detail]) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-soft text-sm font-black text-brand-navy">{icon}</span>
                  <div>
                    <p className="text-xs font-extrabold text-ink">{title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-ink-soft">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] leading-5 text-ink-soft">
                <strong className="text-ink">Trust rule:</strong> dates and requirements are shown with their verification source.
                If a fact is still being checked, UCAG says so.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {marks.length > 0 && (
        <section id="results" className="border-t border-line bg-paper-raised">
          <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-teal">Step 2 & 3</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink">Your study options</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
                Read the exact requirement behind each result. There is no single national APS formula, so UCAG keeps the institution's rule visible.
              </p>
            </div>
            <ResultsSection marks={marks} />
          </div>
        </section>
      )}
    </div>
  );
}
