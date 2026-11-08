"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { filterBursaries } from "@/lib/bursaries/filter";
import { BursaryCard } from "./BursaryCard";
import { ScamExplainer } from "./ScamExplainer";
import { CountUp } from "@/components/CountUp";
import { LABELS } from "@/config/labels";
import type { Bursary, BursaryLevelRequired } from "@/lib/firestore/types";

const LEVEL_OPTIONS: { value: BursaryLevelRequired | "all"; label: string }[] = [
  { value: "all", label: LABELS.bursaries.allLevels },
  { value: "matricOnly", label: LABELS.bursaries.levelMatricOnly },
  { value: "currentlyEnrolled", label: LABELS.bursaries.levelCurrentlyEnrolled },
  { value: "completedQualification", label: LABELS.bursaries.levelCompletedQualification },
];

interface BursariesPageProps {
  bursaries: Bursary[];
}

export function BursariesPage({ bursaries: allBursaries }: BursariesPageProps) {
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [levelFilter, setLevelFilter] = useState<BursaryLevelRequired | "all">("all");

  const fieldOptions = useMemo(() => {
    const fields = new Set<string>();
    for (const b of allBursaries) for (const f of b.fieldsOfStudy) fields.add(f);
    return Array.from(fields).sort();
  }, [allBursaries]);

  const fieldsOfStudy = useMemo(() => (fieldOfStudy ? [fieldOfStudy] : []), [fieldOfStudy]);
  const now = useMemo(() => new Date(), []);

  const bursaries = useMemo(
    () => filterBursaries(allBursaries, { fieldsOfStudy, levelFilter, now }),
    [allBursaries, fieldsOfStudy, levelFilter, now]
  );

  const hasFilters = Boolean(fieldOfStudy) || levelFilter !== "all";

  const clearFilters = () => {
    setFieldOfStudy("");
    setLevelFilter("all");
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-teal to-teal-900 shadow-lg" aria-labelledby="funding-start">
        <div className="p-6 sm:p-10">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-extrabold uppercase tracking-widest text-teal-200">Start with your funding need</p>
            <h2 id="funding-start" className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Find funding, then verify before you apply.</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-teal-50 sm:text-base">
              UCAG helps you discover bursaries from verified records. We help you find the opportunities, but the final decision always rests with the funding provider.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            <li className="flex flex-col rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-raised text-sm font-black text-brand-teal">1</span>
              <h3 className="mt-3 font-display text-base font-bold text-white">Filter</h3>
              <p className="mt-1 text-sm text-teal-100">Choose your study level or specific field.</p>
            </li>
            <li className="flex flex-col rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-amber text-sm font-black text-amber-950">2</span>
              <h3 className="mt-3 font-display text-base font-bold text-white">Check</h3>
              <p className="mt-1 text-sm text-teal-100">Review the required criteria and closing dates.</p>
            </li>
            <li className="flex flex-col rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-coral text-sm font-black text-white">3</span>
              <h3 className="mt-3 font-display text-base font-bold text-white">Apply</h3>
              <p className="mt-1 text-sm text-teal-100">Head straight to the provider&apos;s official page.</p>
            </li>
          </ol>
        </div>
      </section>

      <Link
        href="/internships"
        className="group flex flex-col gap-4 rounded-3xl border-2 border-line bg-paper-raised p-6 transition-all hover:-translate-y-1 hover:border-brand-coral hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-coral/10 text-brand-coral">💼</div>
          <div>
            <p className="text-base font-bold text-ink">Looking for internships or learnerships instead?</p>
            <p className="mt-1 text-sm font-medium text-ink-soft">Work experience and SETA-registered learnerships now have their own dedicated page.</p>
          </div>
        </div>
        <span className="shrink-0 rounded-xl bg-brand-coral px-5 py-2.5 text-sm font-bold text-white transition-transform group-hover:scale-105">Explore Internships &rarr;</span>
      </Link>

      <section className="rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8" aria-labelledby="funding-filters">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="funding-filters" className="font-display text-xl font-black text-ink">Narrow your search</h2>
            <p className="mt-1 text-sm font-medium text-ink-soft">Filters use recorded fields only. Always check the official page for full eligibility.</p>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="min-h-12 rounded-xl border-2 border-line px-5 text-sm font-bold text-ink transition-colors hover:bg-slate-soft focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-ink-soft">
            {LABELS.bursaries.fieldOfStudyFilterLabel}
            <select id="bursaries-field-of-study-filter" name="fieldOfStudy" className="min-h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}>
              <option value="">{LABELS.bursaries.allFields}</option>
              {fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-ink-soft">
            {LABELS.bursaries.levelFilterLabel}
            <select id="bursaries-level-filter" name="levelFilter" className="min-h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as BursaryLevelRequired | "all")}>
              {LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="bursaries-heading">
        <div className="flex items-center gap-3">
          <h2 id="bursaries-heading" className="font-display text-2xl font-black text-ink">Available Bursaries</h2>
          <span className="inline-flex items-center justify-center rounded-full bg-brand-teal/10 px-3 py-1 text-sm font-bold text-brand-teal">
            <CountUp value={bursaries.length} /> Results
          </span>
        </div>
        {bursaries.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-paper-raised p-10 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-base font-bold text-ink">No exact matches found</p>
            <p className="mt-1 text-sm font-medium text-ink-soft">{LABELS.bursaries.noResults}</p>
          </div>
        )}
        <div key={`${fieldOfStudy}-${levelFilter}`} className="grid gap-5 lg:grid-cols-2">
          {bursaries.map((b, i) => <BursaryCard key={b.id} bursary={b} staggerIndex={i} />)}
        </div>
      </section>

      <ScamExplainer />
    </div>
  );
}