import type { ReadinessResult } from "@/lib/readiness";

/** A slim, secondary indicator -- deliberately not another CircledMark
 * (Phase 8's design system reserves that for the one number that matters
 * most per card; this is a supporting figure, not the headline). */
export function ReadinessBar({ readiness }: { readiness: ReadinessResult }) {
  const color =
    readiness.percent >= 80 ? "bg-mark-green" : readiness.percent >= 50 ? "bg-mark-gold" : "bg-slate";

  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span className="whitespace-nowrap">Application readiness</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-soft">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${readiness.percent}%` }}
        />
      </div>
      <span className="font-mono tabular-nums text-ink">{readiness.percent}%</span>
    </div>
  );
}
