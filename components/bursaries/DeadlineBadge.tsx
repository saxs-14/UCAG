"use client";

import { formatDeadlineCountdown } from "@/lib/bursaries/deadline";

export function DeadlineBadge({ closesOn }: { closesOn: string | null }) {
  const text = formatDeadlineCountdown(closesOn, new Date());
  const urgent = closesOn !== null && text !== "No closing date on record" && text !== "Closed";

  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium ${
        urgent
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      }`}
    >
      {text}
    </span>
  );
}
