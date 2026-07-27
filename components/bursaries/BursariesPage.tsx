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

/**
 * Real bursaries/internships, fetched server-side (app/bursaries/page.tsx,
 * lib/catalog/getRealBursariesAndInternships.ts) and passed in as props --
 * config/sampleData.ts's fictional SAMPLE_BURSARIES/SAMPLE_INTERNSHIPS are
 * gone from this component entirely. The field-of-study filter's options
 * are derived from what's actually present in the real data (below)
 * rather than a separate static list, so the dropdown can never offer a
 * category nothing on the page actually has.
 */
export function BursariesPage({ bursaries: allBursaries, internships: allInternships }: BursariesPageProps) {
  const [fieldOfStudy, setFieldOfStudy] = useState<string>("");
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

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <ScamExplainer />

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.bursaries.fieldOfStudyFilterLabel}
          <select
            id="bursaries-field-of-study-filter"
            name="fieldOfStudy"
            className="cursor-pointer rounded-lg border border-line bg-paper-raised px-2 py-1.5 text-ink transition-colors hover:border-brand-teal"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
          >
            <option value="">{LABELS.bursaries.allFields}</option>
            {fieldOptions.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.bursaries.levelFilterLabel}
          <select
            id="bursaries-level-filter"
            name="levelFilter"
            className="cursor-pointer rounded-lg border border-line bg-paper-raised px-2 py-1.5 text-ink transition-colors hover:border-brand-teal"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as BursaryLevelRequired | "all")}
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.bursaries.matricOnlyFilterLabel}
          <select
            id="bursaries-matric-only-filter"
            name="matricOnly"
            className="cursor-pointer rounded-lg border border-line bg-paper-raised px-2 py-1.5 text-ink transition-colors hover:border-brand-teal"
            value={String(matricOnly)}
            onChange={(e) =>
              setMatricOnly(e.target.value === "all" ? "all" : e.target.value === "true")
            }
          >
            {MATRIC_ONLY_OPTIONS.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-ink">
          {LABELS.bursaries.bursariesHeading}
          <span className="rounded-full bg-brand-teal-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-teal">
            <CountUp value={bursaries.length} />
          </span>
        </h2>
        {bursaries.length === 0 && (
          <p className="animate-rise-in text-sm text-ink-faint">{LABELS.bursaries.noResults}</p>
        )}
        {/* key ties this list to the active filters -- changing a filter
            remounts it, replaying the rise-in/stagger entrance so the
            list visibly "refreshes" instead of silently swapping content. */}
        <div key={`${fieldOfStudy}-${levelFilter}`} className="flex flex-col gap-3">
          {bursaries.map((b, i) => (
            <BursaryCard key={b.id} bursary={b} staggerIndex={i} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-ink">
          {LABELS.bursaries.internshipsHeading}
          <span className="rounded-full bg-brand-coral-soft px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-brand-coral">
            <CountUp value={internships.length} />
          </span>
        </h2>
        {internships.length === 0 && (
          <p className="animate-rise-in text-sm text-ink-faint">{LABELS.bursaries.noResults}</p>
        )}
        <div key={`${fieldOfStudy}-${matricOnly}`} className="flex flex-col gap-3">
          {internships.map((i, idx) => (
            <InternshipCard key={i.id} internship={i} staggerIndex={idx} />
          ))}
        </div>
      </section>
    </div>
  );
}
