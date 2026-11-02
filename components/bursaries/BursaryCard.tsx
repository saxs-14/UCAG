import { DeadlineBadge } from "./DeadlineBadge";
import { StampBadge } from "@/components/StampBadge";
import { TiltCard } from "@/components/TiltCard";
import { FieldTag } from "@/components/FieldTag";
import { formatApplicationWindow } from "@/lib/bursaries/deadline";
import type { Bursary } from "@/lib/firestore/types";

const LEVEL_LABELS: Record<Bursary["levelRequired"], string> = {
  matricOnly: "Matric only",
  currentlyEnrolled: "Currently enrolled",
  completedQualification: "Completed a qualification",
};

export function BursaryCard({ bursary, staggerIndex = 0 }: { bursary: Bursary; staggerIndex?: number }) {
  const stagger = Math.min(staggerIndex + 1, 6);
  return (
    <div className={`stagger-${stagger} animate-rise-in h-full`}>
      <TiltCard>
        <article className="flex h-full flex-col rounded-3xl border border-line bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <StampBadge variant="teal" />
              <h3 className="font-display text-lg font-bold text-ink leading-tight">{bursary.name}</h3>
            </div>
            <DeadlineBadge closesOn={bursary.closesOn} />
          </div>
          
          <div className="mt-4 flex-grow">
            <p className="text-sm font-bold text-brand-teal">{bursary.provider}</p>
            <p className="mt-1.5 text-xs font-medium text-ink-soft">
              Recorded value: <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-ink">{bursary.value}</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
              <span>📅</span> {formatApplicationWindow(bursary.opensOn, bursary.closesOn)}
            </p>
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-brand-teal/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-brand-teal">
                {LEVEL_LABELS[bursary.levelRequired]}
              </span>
              {bursary.fieldsOfStudy.map((field) => (
                <FieldTag key={field} field={field} />
              ))}
            </div>
            
            {bursary.criteria.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                {bursary.criteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-teal mt-0.5">•</span>
                    <span className="leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs font-medium leading-relaxed text-ink-soft border border-line/40">
            Always double-check criteria on the official site before applying.
          </div>
          
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-4">
            <a
              href={bursary.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-mark-green px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-mark-green/30"
            >
              Apply Officially
            </a>
            <a href={bursary.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-ink-soft transition-colors hover:text-brand-teal hover:underline">
              Source verified {bursary.verifiedOn} ↗
            </a>
          </div>
        </article>
      </TiltCard>
    </div>
  );
}