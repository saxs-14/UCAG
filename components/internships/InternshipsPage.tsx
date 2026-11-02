"use client";

import { useMemo, useState } from "react";
import { filterInternships } from "@/lib/bursaries/filter";
import { InternshipCard } from "@/components/bursaries/InternshipCard";
import { ScamExplainer } from "@/components/bursaries/ScamExplainer";
import { CountUp } from "@/components/CountUp";
import { LABELS } from "@/config/labels";
import type { Internship, InternshipType } from "@/lib/firestore/types";

const TYPE_OPTIONS: { value: InternshipType | "all"; label: string }[] = [
  { value: "all", label: LABELS.internships.allTypes },
  { value: "internship", label: LABELS.internships.typeInternship },
  { value: "learnership", label: LABELS.internships.typeLearnership },
];

const MATRIC_ONLY_OPTIONS: { value: boolean | "all"; label: string }[] = [
  { value: "all", label: LABELS.internships.matricOnlyAll },
  { value: true, label: LABELS.internships.matricOnlyTrue },
  { value: false, label: LABELS.internships.matricOnlyFalse },
];

interface InternshipsPageProps {
  internships: Internship[];
}

export function InternshipsPage({ internships: allInternships }: InternshipsPageProps) {
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [typeFilter, setTypeFilter] = useState<InternshipType | "all">("all");
  const [matricOnly, setMatricOnly] = useState<boolean | "all">("all");

  const fieldOptions = useMemo(() => {
    const fields = new Set<string>();
    for (const i of allInternships) for (const f of i.fieldsOfStudy) fields.add(f);
    return Array.from(fields).sort();
  }, [allInternships]);

  const fieldsOfStudy = useMemo(() => (fieldOfStudy ? [fieldOfStudy] : []), [fieldOfStudy]);
  const now = useMemo(() => new Date(), []);

  const internships = useMemo(
    () => filterInternships(allInternships, { fieldsOfStudy, matricOnly, typeFilter, now }),
    [allInternships, fieldsOfStudy, matricOnly, typeFilter, now]
  );

  const hasFilters = Boolean(fieldOfStudy) || typeFilter !== "all" || matricOnly !== "all";

  const clearFilters = () => {
    setFieldOfStudy("");
    setTypeFilter("all");
    setMatricOnly("all");
  };

  return (
    <div className="flex w-full max-w-5xl flex-col gap-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-coral to-rose-900 shadow-lg" aria-labelledby="internships-start">
        <div className="p-6 sm:p-10">
          <div className="max-w-2xl text-white">
            <p className="text-xs font-extrabold uppercase tracking-widest text-rose-200">Start with your work experience need</p>
            <h2 id="internships-start" className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">Find verified internships and learnerships.</h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-rose-50 sm:text-base">
              UCAG helps you discover opportunities based on official, verified records to jumpstart your career journey safely.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8" aria-labelledby="internships-filters">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="internships-filters" className="font-display text-xl font-black text-ink">Narrow your search</h2>
            <p className="mt-1 text-sm font-medium text-ink-soft">Filters use recorded fields only. Always check the official provider for final eligibility.</p>
          </div>
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="min-h-12 rounded-xl border-2 border-line px-5 text-sm font-bold text-ink transition-colors hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-brand-coral/20">
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm font-bold text-ink-soft">
            {LABELS.internships.typeFilterLabel}
            <select id="internships-type-filter" name="typeFilter" className="min-h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-4 text-base font-medium text-ink transition-all focus:border-brand-coral focus:outline-none focus:ring-4 focus:ring-brand-coral/20" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as InternshipType | "all")}>
              {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-ink-soft">
            {LABELS.internships.fieldOfStudyFilterLabel}
            <select id="internships-field-of-study-filter" name="fieldOfStudy" className="min-h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-4 text-base font-medium text-ink transition-all focus:border-brand-coral focus:outline-none focus:ring-4 focus:ring-brand-coral/20" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}>
              <option value="">{LABELS.internships.allFields}</option>
              {fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-ink-soft">
            {LABELS.internships.matricOnlyFilterLabel}
            <select id="internships-matric-only-filter" name="matricOnly" className="min-h-12 w-full cursor-pointer rounded-xl border border-line bg-paper px-4 text-base font-medium text-ink transition-all focus:border-brand-coral focus:outline-none focus:ring-4 focus:ring-brand-coral/20" value={String(matricOnly)} onChange={(e) => setMatricOnly(e.target.value === "all" ? "all" : e.target.value === "true")}>
              {MATRIC_ONLY_OPTIONS.map((opt) => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-5" aria-labelledby="internships-heading">
        <div className="flex items-center gap-3">
          <h2 id="internships-heading" className="font-display text-2xl font-black text-ink">{LABELS.internships.heading}</h2>
          <span className="inline-flex items-center justify-center rounded-full bg-brand-coral/10 px-3 py-1 text-sm font-bold text-brand-coral">
            <CountUp value={internships.length} /> Results
          </span>
        </div>
        
        {internships.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-line bg-paper-raised p-10 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-base font-bold text-ink">No exact matches found</p>
            <p className="mt-1 text-sm font-medium text-ink-soft">{LABELS.internships.noResults}</p>
          </div>
        )}
        <div key={`${fieldOfStudy}-${typeFilter}-${matricOnly}`} className="grid gap-5 lg:grid-cols-2">
          {internships.map((i, idx) => <InternshipCard key={i.id} internship={i} staggerIndex={idx} />)}
        </div>
      </section>

      <ScamExplainer />
    </div>
  );
}