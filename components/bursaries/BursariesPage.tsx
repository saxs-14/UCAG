"use client";

import { useMemo, useState } from "react";
import { filterBursaries, filterInternships } from "@/lib/bursaries/filter";
import { BursaryCard } from "./BursaryCard";
import { InternshipCard } from "./InternshipCard";
import { ScamExplainer } from "./ScamExplainer";
import { CountUp } from "@/components/CountUp";
import { LABELS } from "@/config/labels";
import type { Bursary, BursaryLevelRequired, Internship } from "@/lib/firestore/types";

const LEVEL_OPTIONS: { value: BursaryLevelRequired | "all"; label: string }[] = [
  { value: "all", label: LABELS.bursaries.allLevels },
  { value: "matricOnly", label: LABELS.bursaries.levelMatricOnly },
  { value: "currentlyEnrolled", label: LABELS.bursaries.levelCurrentlyEnrolled },
  { value: "completedQualification", label: LABELS.bursaries.levelCompletedQualification },
];

const MATRIC_ONLY_OPTIONS: { value: boolean | "all"; label: string }[] = [
  { value: "all", label: LABELS.bursaries.matricOnlyAll },
  { value: true, label: LABELS.bursaries.matricOnlyTrue },
  { value: false, label: LABELS.bursaries.matricOnlyFalse },
];

interface BursariesPageProps {
  bursaries: Bursary[];
  internships: Internship[];
}

export function BursariesPage({ bursaries: allBursaries, internships: allInternships }: BursariesPageProps) {
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [levelFilter, setLevelFilter] = useState<BursaryLevelRequired | "all">("all");
  const [matricOnly, setMatricOnly] = useState<boolean | "all">("all");

  const fieldOptions = useMemo(() => {
    const fields = new Set<string>();
    for (const b of allBursaries) for (const f of b.fieldsOfStudy) fields.add(f);
    for (const i of allInternships) for (const f of i.fieldsOfStudy) fields.add(f);
    return Array.from(fields).sort();
  }, [allBursaries, allInternships]);

  const fieldsOfStudy = useMemo(() => (fieldOfStudy ? [fieldOfStudy] : []), [fieldOfStudy]);
  const now = useMemo(() => new Date(), []);

  const bursaries = useMemo(
    () => filterBursaries(allBursaries, { fieldsOfStudy, levelFilter, now }),
    [allBursaries, fieldsOfStudy, levelFilter, now]
  );
  const internships = useMemo(
    () => filterInternships(allInternships, { fieldsOfStudy, matricOnly, now }),
    [allInternships, fieldsOfStudy, matricOnly, now]
  );

  const hasFilters = Boolean(fieldOfStudy) || levelFilter !== "all" || matricOnly !== "all";

  const clearFilters = () => {
    setFieldOfStudy("");
    setLevelFilter("all");
    setMatricOnly("all");
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <section className="card-learner rounded-2xl p-5 sm:p-6" aria-labelledby="funding-start">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-teal">Start with your funding need</p>
          <h2 id="funding-start" className="mt-1 text-2xl font-bold tracking-tight text-ink">Find funding, then verify before you apply.</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            UCAG helps you discover bursaries and internships from the records we have verified.
            It does not decide whether a provider will award you funding.
          </p>
        </div>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          <li className="rounded-xl border border-line bg-paper-raised p-4"><span className="font-mono text-xs font-bold text-brand-teal">1</span><h3 className="mt-1 text-sm font-bold text-ink">Filter</h3><p className="mt-1 text-xs leading-5 text-ink-soft">Choose your level or field.</p></li>
          <li className="rounded-xl border border-line bg-paper-raised p-4"><span className="font-mono text-xs font-bold text-brand-teal">2</span><h3 className="mt-1 text-sm font-bold text-ink">Check</h3><p className="mt-1 text-xs leading-5 text-ink-soft">Read the recorded criteria and dates.</p></li>
          <li className="rounded-xl border border-line bg-paper-raised p-4"><span className="font-mono text-xs font-bold text-brand-teal">3</span><h3 className="mt-1 text-sm font-bold text-ink">Apply</h3><p className="mt-1 text-xs leading-5 text-ink-soft">Open the provider's official application page.</p></li>
        </ol>
      </section>

      <section className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-6" aria-labelledby="funding-filters">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="funding-filters" className="text-lg font-bold text-ink">Narrow the list</h2><p className="mt-1 text-xs text-ink-faint">Filters use recorded fields only. They are not an eligibility verdict.</p></div>
          {hasFilters && <button type="button" onClick={clearFilters} className="min-h-11 rounded-full border border-line px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-teal hover:text-brand-teal">Clear filters</button>}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {LABELS.bursaries.fieldOfStudyFilterLabel}
            <select id="bursaries-field-of-study-filter" name="fieldOfStudy" className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink transition-colors hover:border-brand-teal focus:border-brand-teal" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)}>
              <option value="">{LABELS.bursaries.allFields}</option>
              {fieldOptions.map((field) => <option key={field} value={field}>{field}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {LABELS.bursaries.levelFilterLabel}
            <select id="bursaries-level-filter" name="levelFilter" className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink transition-colors hover:border-brand-teal focus:border-brand-teal" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value as BursaryLevelRequired | "all")}>
              {LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {LABELS.bursaries.matricOnlyFilterLabel}
            <select id="bursaries-matric-only-filter" name="matricOnly" className="min-h-11 rounded-xl border border-line bg-paper px-3 text-ink transition-colors hover:border-brand-teal focus:border-brand-teal" value={String(matricOnly)} onChange={(e) => setMatricOnly(e.target.value === "all" ? "all" : e.target.value === "true")}>
              {MATRIC_ONLY_OPTIONS.map((opt) => <option key={String(opt.value)} value={String(opt.value)}>{opt.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="bursaries-heading">
        <div><h2 id="bursaries-heading" className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-ink">Bursaries <span className="rounded-full bg-brand-teal-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-teal"><CountUp value={bursaries.length} /></span></h2><p className="mt-1 text-xs text-ink-faint">Funding opportunities currently present in the verified catalogue.</p></div>
        {bursaries.length === 0 && <p className="rounded-xl border border-line p-4 text-sm text-ink-faint">{LABELS.bursaries.noResults}</p>}
        <div key={`${fieldOfStudy}-${levelFilter}`} className="grid gap-4 lg:grid-cols-2">{bursaries.map((b, i) => <BursaryCard key={b.id} bursary={b} staggerIndex={i} />)}</div>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="internships-heading">
        <div><h2 id="internships-heading" className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-ink">Internships <span className="rounded-full bg-brand-coral-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-coral"><CountUp value={internships.length} /></span></h2><p className="mt-1 text-xs text-ink-faint">Work opportunities with a recorded closing date and provider source where available.</p></div>
        {internships.length === 0 && <p className="rounded-xl border border-line p-4 text-sm text-ink-faint">{LABELS.bursaries.noResults}</p>}
        <div key={`${fieldOfStudy}-${matricOnly}`} className="grid gap-4 lg:grid-cols-2">{internships.map((i, idx) => <InternshipCard key={i.id} internship={i} staggerIndex={idx} />)}</div>
      </section>

      <ScamExplainer />
    </div>
  );
}
