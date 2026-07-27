import { DeadlineBadge } from "./DeadlineBadge";
import { StampBadge } from "@/components/StampBadge";
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
    // Entrance animation and hover-lift both animate `transform`, so
    // they're split across two elements: an animation's held end-state
    // (fill-mode both) outranks a plain :hover rule on the same
    // property in the cascade, silently no-opping the hover otherwise.
    <div className={`stagger-${stagger} animate-rise-in`}>
      <article className="rounded-xl border border-line bg-paper-raised p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <StampBadge variant="teal" />
            <h3 className="text-base font-semibold text-ink">{bursary.name}</h3>
          </div>
          <DeadlineBadge closesOn={bursary.closesOn} />
        </div>
        <p className="mt-2 text-sm text-ink-soft">{bursary.provider}</p>
        <p className="mt-1 text-sm font-mono tabular-nums text-ink">{bursary.value}</p>
        <p className="mt-1 font-mono text-xs tabular-nums text-ink-soft">
          {formatApplicationWindow(bursary.opensOn, bursary.closesOn)}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          {LEVEL_LABELS[bursary.levelRequired]} · {bursary.fieldsOfStudy.join(", ")}
        </p>
        {bursary.criteria.length > 0 && (
          <ul className="mt-2 list-inside list-disc text-xs text-ink-soft">
            {bursary.criteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
          <a
            href={bursary.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-11 rounded-full bg-mark-green px-4 py-1.5 font-medium text-white transition-transform hover:scale-[1.03] active:scale-[0.97]"
          >
            Apply
          </a>
          <a href={bursary.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-ink-faint underline">
            Verified {bursary.verifiedOn} · Source
          </a>
        </div>
      </article>
    </div>
  );
}
