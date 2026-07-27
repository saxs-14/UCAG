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
  const scatter = staggerIndex % 2 === 0 ? "scatter-a" : "scatter-b";
  return (
    // Entrance animation and the scattered-paper rotation both animate
    // `transform`, so they're split across two elements -- combining
    // them on one node means the animation's held end-state (fill-mode
    // both/forwards) wins the cascade and silently erases the rotation.
    <div className={`stagger-${stagger} animate-rise-in`}>
      <article className={`${scatter} flex flex-col gap-2 rounded-xl bg-paper-raised p-4 shadow-sm hover:shadow-md`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <StampBadge variant="teal" rotate={-7} />
            <h3 className="hover-wiggle pt-1 text-base font-semibold text-ink">{bursary.name}</h3>
          </div>
          <DeadlineBadge closesOn={bursary.closesOn} />
        </div>
        <p className="text-sm text-ink-soft">{bursary.provider}</p>
        <p className="text-sm font-mono tabular-nums text-ink">{bursary.value}</p>
        <p className="font-mono text-xs tabular-nums text-ink-soft">
          {formatApplicationWindow(bursary.opensOn, bursary.closesOn)}
        </p>
        <p className="text-xs text-ink-faint">
          {LEVEL_LABELS[bursary.levelRequired]} · {bursary.fieldsOfStudy.join(", ")}
        </p>
        {bursary.criteria.length > 0 && (
          <ul className="list-inside list-disc text-xs text-ink-soft">
            {bursary.criteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between border-t border-line pt-2 text-xs">
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
