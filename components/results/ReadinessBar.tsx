import type { ReadinessResult } from "@/lib/readiness";

/** A slim, secondary indicator -- deliberately not another CircledMark
 * (Phase 8's design system reserves that for the one number that matters
 * most per card; this is a supporting figure, not the headline). */
export function ReadinessBar({ readiness }: { readiness: ReadinessResult }) {
  const color =
    readiness.percent >= 80 ? "bg-mark-green" : readiness.percent >= 50 ? "bg-mark-gold" : "bg-slate";

  const progressClass =
    readiness.percent >= 80 ? "readiness-progress-green" : readiness.percent >= 50 ? "readiness-progress-gold" : "readiness-progress-slate";

  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span className="whitespace-nowrap">Application readiness</span>
      <progress
        value={readiness.percent}
        max={100}
        className={`h-1.5 w-full rounded-full bg-slate-soft ${progressClass}`}
      />
      <span className={`font-mono tabular-nums ${color}`}>{readiness.percent}%</span>
    </div>
  );
}
