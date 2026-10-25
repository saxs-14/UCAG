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
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <section className="card-learner rounded-2xl p-5 sm:p-6" aria-labelledby="internships-start">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-teal">Start with your work experience need</p>
          <h2 id="internships-start" className="mt-1 text-2xl font-bold tracking-tight text-ink">Internships and learnerships, verified before you apply.</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            UCAG helps you discover internships and SETA-registered learnerships from the records we have verified.
            It does not decide whether a provider will award you a place.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6" aria-labelledby="internships-filters">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="internships-filters" className="font-display text-lg font-bold text-ink">Narrow the list</h2><p className="mt-1 text-xs text-ink-faint">Filters use recorded fields only. They are not an eligibility verdict.</p></div>
          {hasFilters && <button type="button" onClick={clearFilters} className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-teal hover:text-brand-teal">Clear filters</button>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {LABELS.internships.typeFilterLabel}
            <select id="internships-type-filter" name="typeFilter" className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink transition-colors hover:border-brand-teal focus:border-brand-teal" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as InternshipType | "all")}>
              {TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {LABELS.internships.fieldOfStudyFilterLabel}
            <select id="internships-field-of-study-filter" name="fieldOfStudy" className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink transition-colors hover:border-brand-teal focus:border-brand-teal" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}>
              <option value="">{LABELS.internships.allFields}</option>
              {fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {LABELS.internships.matricOnlyFilterLabel}
            <select id="internships-matric-only-filter" name="matricOnly" className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink transition-colors hover:border-brand-teal focus:border-brand-teal" value={String(matricOnly)} onChange={(e) => setMatricOnly(e.target.value === "all" ? "all" : e.target.value === "true")}>
              {MATRIC_ONLY_OPTIONS.map((opt) => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="internships-heading">
        <div><h2 id="internships-heading" className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-ink">{LABELS.internships.heading} <span className="rounded-full bg-brand-coral-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-coral"><CountUp value={internships.length} /></span></h2><p className="mt-1 text-xs text-ink-faint">Work opportunities with a recorded closing date and provider source where available.</p></div>
        {internships.length === 0 && <p className="rounded-xl border border-line p-4 text-sm text-ink-faint">{LABELS.internships.noResults}</p>}
        <div key={`${fieldOfStudy}-${typeFilter}-${matricOnly}`} className="grid gap-4 lg:grid-cols-2">{internships.map((i, idx) => <InternshipCard key={i.id} internship={i} staggerIndex={idx} />)}</div>
      </section>

      <ScamExplainer />
    </div>
  );
}
