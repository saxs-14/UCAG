"use client";

import { formatDeadlineCountdown } from "@/lib/bursaries/deadline";

export function DeadlineBadge({ closesOn }: { closesOn: string | null }) {
  const text = formatDeadlineCountdown(closesOn, new Date());
  const urgent = closesOn !== null && text !== "No closing date on record" && text !== "Closed";

  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-xs font-medium tabular-nums ${
        urgent ? "animate-soft-glow bg-mark-gold-soft text-mark-gold" : "bg-slate-soft text-ink-faint"
      }`}
      style={urgent ? ({ "--glow-color": "var(--color-mark-gold)" } as React.CSSProperties) : undefined}
    >
      {text}
    </span>
  );
}
