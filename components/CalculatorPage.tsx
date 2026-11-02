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
  { number: "01", title: "Explore programmes", detail: "Compare courses, qualifications and institutions.", href: "/programmes", accent: "bg-brand-violet/10 text-brand-violet" },
  { number: "02", title: "Find funding", detail: "Discover bursaries and internships from trusted sources.", href: "/bursaries", accent: "bg-amber-100 text-amber-700" },
  { number: "03", title: "Plan your next step", detail: "Save your options and prepare to apply.", href: "/account", accent: "bg-rose-100 text-rose-700" },
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
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 -z-10 hidden size-80 rounded-full bg-amber-200/40 sm:block" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[6%] top-44 -z-10 hidden size-24 rotate-12 rounded-[1.75rem] bg-indigo-200/40 sm:block" />
        
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-brand-teal">
              ✨ Verified, not guessed
            </p>
            <h1 className="mt-6 font-display text-4xl font-black leading-none tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Find out what you can <span className="inline-block rounded-2xl bg-brand-teal px-3 py-1 text-white shadow-md">study.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-ink-soft sm:text-lg">
              Enter your National Senior Certificate subjects and marks. Get a clear, reliable view of the programmes you qualify for, the ones within reach, and your best next steps.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="#calculator-form-title" className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-brand-teal px-8 text-base font-black text-white shadow-xl shadow-brand-teal/30 transition-transform hover:-translate-y-0.5 active:scale-95">
                Calculate My Options <span aria-hidden="true" className="ml-2">→</span>
              </a>
              <span className="text-xs font-bold text-ink-faint">Free to use · No account required</span>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-ink-soft">
              <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>Institution-specific rules</span>
              <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>Clear eligibility explanations</span>
              <span className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>Official source verification</span>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-teal">Quick Start Guide</p>
                <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-ink">Start with your marks</h2>
                <p className="mt-1.5 text-sm font-medium text-ink-soft">A guided path from your NSC results to realistic study options.</p>
              </div>
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-teal/10 text-xl font-black text-brand-teal sm:flex" aria-hidden="true">↗</span>
            </div>
            <ol className="mt-6 flex flex-col gap-4">
              {[
                ["1", "Add your subjects", "Include your language, Maths, Life Orientation and electives.", "bg-brand-teal/10 text-brand-teal"],
                ["2", "Calculate your APS", "UCAG applies available institution-specific calculation rules.", "bg-amber-100 text-amber-800"],
                ["3", "Understand your options", "Review matched programmes and the requirements behind each result.", "bg-brand-violet/10 text-brand-violet"],
              ].map(([number, title, detail, accent]) => (
                <li key={number} className="flex gap-4 rounded-2xl border border-line/60 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-base font-black ${accent}`}>{number}</span>
                  <div>
                    <span className="block font-bold text-ink">{title}</span>
                    <span className="mt-0.5 block text-xs font-medium leading-relaxed text-ink-soft">{detail}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-line/60 pt-4 text-xs font-medium leading-relaxed text-ink-soft">
              <strong className="text-ink">Note:</strong> Admission requirements differ by institution and year. Always check official sources before applying.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line/60 bg-amber-50/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-xl font-black text-amber-950 shadow-sm" aria-hidden="true">🛡️</span>
            <div>
              <h2 className="font-display text-base font-black text-amber-950">Verified where it matters</h2>
              <p className="mt-0.5 text-xs font-medium text-amber-900/80">Admissions facts should show their source, verification date and academic year.</p>
            </div>
          </div>
          <Link href="/institutions" className="inline-flex items-center gap-2 text-sm font-bold text-amber-950 hover:underline">
            Explore institutions <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:px-8">
        <div className="min-w-0">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-brand-teal">Step-by-Step</p>
            <h2 id="calculator-form-title" className="mt-2 font-display text-3xl font-black tracking-tight text-ink">Enter your NSC results</h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-ink-soft">
              Use percentages from your latest results certificate. You can review and update them at any time.
            </p>
          </div>

          <SubjectForm
            key={formKey}
            onMarksChange={(newMarks) => {
              setMarks(newMarks);
              fetch("/api/activity/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event: "calculator_completed" }),
              }).catch(() => {});
            }}
            initialState={initialState}
          />

          {marks.length > 0 && (
            <div className="no-print mt-6 flex flex-wrap items-center gap-4 rounded-3xl border border-brand-teal/30 bg-brand-teal/5 p-6 shadow-sm">
              <SaveMarksButton marks={marks} />
              <span className="text-xs font-medium text-ink-soft">
                {marks.length} subjects captured. Saved securely on your device.
              </span>
            </div>
          )}
        </div>

        <aside className="no-print hidden lg:sticky lg:top-28 lg:block" aria-label="How UCAG works">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-widest text-brand-teal">What to expect</p>
            <div className="mt-5 space-y-5">
              {[
                ["✓", "Qualify", "Programmes where recorded requirements are fully met."],
                ["≈", "Almost qualify", "Exact APS or subject gaps so you know what to improve."],
                ["→", "Not yet", "A realistic alternative pathway instead of a dead end."],
              ].map(([icon, title, detail]) => (
                <div key={title} className="flex gap-3.5">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-ink shadow-sm">{icon}</span>
                  <div>
                    <p className="text-sm font-bold text-ink">{title}</p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-ink-soft">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-line/60 pt-5">
              <p className="text-xs font-medium leading-relaxed text-ink-soft">
                <strong className="text-ink">Trust Rule:</strong> Requirements are institution-specific. Unverified rules are explicitly noted.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="border-y border-line/60 bg-slate-50/50">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-brand-teal">Your Journey</p>
            <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink">Your next steps, all in one place</h2>
            <p className="mt-2 text-sm font-medium text-ink-soft">Move smoothly from exploring options to finding funding and applying.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <Link key={step.number} href={step.href} className="group flex flex-col rounded-3xl border border-line bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <span className={`flex size-14 items-center justify-center rounded-2xl font-display text-lg font-black shadow-sm ${step.accent}`}>{step.number}</span>
                <h3 className="mt-6 font-display text-2xl font-black text-ink">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">{step.detail}</p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-teal">
                  Explore <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {marks.length > 0 && (
        <section id="results" className="border-t border-line/60 bg-paper py-16">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-widest text-brand-teal">Results</p>
              <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink">Your study options</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-ink-soft">
                Read the exact requirements behind each result. UCAG maintains distinct institution rules for complete accuracy.
              </p>
            </div>
            <ResultsSection marks={marks} />
          </div>
        </section>
      )}
    </div>
  );
}