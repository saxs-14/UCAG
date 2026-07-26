import { DeadlineBadge } from "./DeadlineBadge";
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
    <article
      className={`stagger-${stagger} animate-rise-in flex flex-col gap-2 rounded-xl border-l-4 border-brand-teal bg-paper-raised p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="hover-wiggle text-base font-semibold text-ink">{bursary.name}</h3>
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
  );
}
