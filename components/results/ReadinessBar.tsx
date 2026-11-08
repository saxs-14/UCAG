import type { ReadinessResult } from "@/lib/readiness";

export function ReadinessBar({ readiness }: { readiness: ReadinessResult }) {
  const color =
    readiness.percent >= 80 ? "bg-emerald-500" : readiness.percent >= 50 ? "bg-amber-500" : "bg-rose-500";
  const textColor = 
    readiness.percent >= 80 ? "text-emerald-700" : readiness.percent >= 50 ? "text-amber-700" : "text-rose-700";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-bold">
        <span className="text-ink-soft uppercase tracking-wide">Application readiness</span>
        <span className={`font-mono ${textColor}`}>{readiness.percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-soft shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${readiness.percent}%` }}
        />
      </div>
    </div>
  );
}