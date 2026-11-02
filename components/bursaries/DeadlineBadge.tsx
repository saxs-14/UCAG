"use client";

import { formatDeadlineCountdown } from "@/lib/bursaries/deadline";

export function DeadlineBadge({ closesOn }: { closesOn: string | null }) {
  const text = formatDeadlineCountdown(closesOn, new Date());
  const urgent = closesOn !== null && text !== "No closing date on record" && text !== "Closed";

  return (
    <span
      className={`shrink-0 inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm transition-colors ${
        urgent 
          ? "border border-mark-gold/30 bg-mark-gold/10 text-mark-gold animate-pulse" 
          : "border border-line bg-slate-50 text-ink-faint"
      }`}
    >
      {text}
    </span>
  );
}