import Link from "next/link";
import { LABELS } from "@/config/labels";
import { academicUnitLabel } from "@/lib/academicUnitLabel";
import type { Faculty, Institution, Programme, School } from "@/lib/firestore/types";

interface UnscoredProgrammeCardProps {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  staggerIndex?: number;
}

export function UnscoredProgrammeCard({
  programme,
  institution,
  faculty,
  school,
  staggerIndex = 0,
}: UnscoredProgrammeCardProps) {
  const stagger = Math.min(staggerIndex + 1, 6);
  
  return (
    <article className={`stagger-${stagger} animate-pop-in flex flex-col gap-5 rounded-3xl border border-line/60 bg-white p-6 shadow-sm transition-all hover:shadow-md sm:p-8`}>
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-slate-200">
            {LABELS.verification.apsRulesBeingVerified}
          </span>
          <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-ink-soft shadow-sm border border-line">
            Verified Programme
          </span>
        </div>
        <div>
          <h3 className="font-display text-xl font-black leading-tight text-ink">
            <Link href={`/programmes/${programme.id}`} className="transition-colors hover:text-brand-teal hover:underline">
              {programme.name}
            </Link>
          </h3>
          <p className="mt-2 text-sm font-medium text-ink-soft">
            {institution.name} · {academicUnitLabel(faculty, school)}
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-line/50 bg-slate-50 p-5 shadow-inner text-sm">
        {programme.minAps !== null && (
          <p className="font-bold text-ink">
            Minimum APS: <span className="font-mono text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded">{programme.minAps}</span>
          </p>
        )}
        <ul className="flex flex-col gap-1.5 text-ink-soft font-medium">
          {programme.subjectRequirements.map((req, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>
                {req.subjectCode}
                {req.minLevel !== undefined ? ` (Level ${req.minLevel})` : ""}
                {req.minPercent !== undefined ? ` (${req.minPercent}%)` : ""}
              </span>
            </li>
          ))}
          {programme.additionalRequirements.map((req, i) => (
            <li key={`extra-${i}`} className="flex items-start gap-2 text-ink-faint">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-4 text-sm font-medium leading-relaxed text-ink-soft">
        <div className="flex items-start gap-3">
          <span className="text-xl">⏳</span>
          <p>
            We cannot calculate your personal APS score for {institution.shortName} just yet. Their exact APS
            formula hasn&apos;t been confirmed against our official sources. The requirements listed above are verified; the score comparison is pending.
          </p>
        </div>
      </div>

      <p className="mt-2 border-t border-line/40 pt-4 text-xs font-bold text-ink-faint text-center">
        Verified {programme.verifiedOn} ·{" "}
        <a href={programme.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline transition-colors">
          Official Source ↗
        </a>
      </p>
    </article>
  );
}