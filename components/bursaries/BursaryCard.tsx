import { DeadlineBadge } from "./DeadlineBadge";
import type { Bursary } from "@/lib/firestore/types";

const LEVEL_LABELS: Record<Bursary["levelRequired"], string> = {
  matricOnly: "Matric only",
  currentlyEnrolled: "Currently enrolled",
  completedQualification: "Completed a qualification",
};

export function BursaryCard({ bursary }: { bursary: Bursary }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg bg-paper-raised border border-line p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{bursary.name}</h3>
        <DeadlineBadge closesOn={bursary.closesOn} />
      </div>
      <p className="text-sm text-ink-soft">{bursary.provider}</p>
      <p className="text-sm font-mono tabular-nums text-ink">{bursary.value}</p>
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
          className="rounded bg-mark-green px-3 py-1.5 font-medium text-white hover:opacity-90"
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
