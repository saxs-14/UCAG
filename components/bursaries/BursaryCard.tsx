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
    // Entrance animation and the 3D tilt/hover-lift both animate
    // `transform`, so they're split across separate elements: an
    // animation's held end-state (fill-mode both) outranks a plain
    // :hover rule (or a JS-set inline transform) on the same property
    // in the cascade otherwise.
    <div className={`stagger-${stagger} animate-rise-in`}>
      <TiltCard>
        <article className="elevate rounded-xl border border-line bg-paper-raised p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <StampBadge variant="teal" />
              <h3 className="text-base font-semibold text-ink">{bursary.name}</h3>
            </div>
            <DeadlineBadge closesOn={bursary.closesOn} />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{bursary.provider}</p>
          <p className="mt-1 text-xs text-ink-faint">Funding amount recorded: <span className="font-medium text-ink-soft">{bursary.value}</span></p>
          <p className="mt-1 font-mono text-xs tabular-nums text-ink-soft">
            {formatApplicationWindow(bursary.opensOn, bursary.closesOn)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-ink-faint">{LEVEL_LABELS[bursary.levelRequired]}</span>
            {bursary.fieldsOfStudy.map((field) => (
              <FieldTag key={field} field={field} />
            ))}
          </div>
          {bursary.criteria.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-ink-soft">
              {bursary.criteria.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
          <p className="mt-3 rounded-lg bg-slate-soft px-3 py-2 text-xs leading-5 text-ink-soft">Check the criteria and dates on the provider's page before submitting. UCAG does not guarantee funding.</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 text-xs">
            <a
              href={bursary.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 rounded-full bg-mark-green px-4 py-1.5 font-medium text-white transition-transform hover-fine:scale-[1.03] active:scale-[0.97]"
            >
              Apply
            </a>
            <a href={bursary.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-ink-faint underline">
              Verified {bursary.verifiedOn} · Source
            </a>
          </div>
        </article>
      </TiltCard>
    </div>
  );
}
