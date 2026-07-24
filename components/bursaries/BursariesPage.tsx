"use client";

import { useMemo, useState } from "react";
import { filterBursaries, filterInternships } from "@/lib/bursaries/filter";
import { BursaryCard } from "./BursaryCard";
import { InternshipCard } from "./InternshipCard";
import { ScamExplainer } from "./ScamExplainer";
import { LABELS } from "@/config/labels";
import {
  SAMPLE_BURSARIES,
  SAMPLE_FIELDS_OF_STUDY,
  SAMPLE_INTERNSHIPS,
} from "@/config/sampleData";
import type { BursaryLevelRequired } from "@/lib/firestore/types";

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

/**
 * Bursaries/internships list backed by SAMPLE_BURSARIES/SAMPLE_INTERNSHIPS
 * (config/sampleData.ts -- explicitly fictional; real listings need Phase
 * 4 ingestion to actually populate the `bursaries`/`internships`
 * collections, which isn't live yet). Field-of-study filtering is
 * self-service here rather than auto-derived from the calculator's
 * qualify-bucket results -- that integration needs Phase 6's saved-
 * profile/shortlist persistence to carry state across routes; until
 * then, this page stands alone.
 */
export function BursariesPage() {
  const [fieldOfStudy, setFieldOfStudy] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<BursaryLevelRequired | "all">("all");
  const [matricOnly, setMatricOnly] = useState<boolean | "all">("all");

  const fieldsOfStudy = useMemo(() => (fieldOfStudy ? [fieldOfStudy] : []), [fieldOfStudy]);
  const now = useMemo(() => new Date(), []);

  const bursaries = useMemo(
    () => filterBursaries(SAMPLE_BURSARIES, { fieldsOfStudy, levelFilter, now }),
    [fieldsOfStudy, levelFilter, now]
  );
  const internships = useMemo(
    () => filterInternships(SAMPLE_INTERNSHIPS, { fieldsOfStudy, matricOnly, now }),
    [fieldsOfStudy, matricOnly, now]
  );

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="rounded border border-dashed border-mark-gold bg-mark-gold-soft p-3 text-sm text-ink">
        These listings are <strong>sample/fictional data</strong>, not real bursaries or
        internships -- see config/sampleData.ts. Real, verified listings land once Phase 4
        ingestion is connected to a live Firestore project.
      </div>

      <ScamExplainer />

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.bursaries.fieldOfStudyFilterLabel}
          <select
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
          >
            <option value="">{LABELS.bursaries.allFields}</option>
            {SAMPLE_FIELDS_OF_STUDY.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.bursaries.levelFilterLabel}
          <select
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink"
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
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink"
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
        <h2 className="text-xl font-bold tracking-tight text-ink">{LABELS.bursaries.bursariesHeading}</h2>
        {bursaries.length === 0 && (
          <p className="text-sm text-ink-faint">{LABELS.bursaries.noResults}</p>
        )}
        {bursaries.map((b) => (
          <BursaryCard key={b.id} bursary={b} />
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold tracking-tight text-ink">{LABELS.bursaries.internshipsHeading}</h2>
        {internships.length === 0 && (
          <p className="text-sm text-ink-faint">{LABELS.bursaries.noResults}</p>
        )}
        {internships.map((i) => (
          <InternshipCard key={i.id} internship={i} />
        ))}
      </section>
    </div>
  );
}
