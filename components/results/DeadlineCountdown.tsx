"use client";

import { useEffect, useState } from "react";
import { Clock, Hourglass } from "lucide-react";
import type { ApplicationWindow, ApplicationWindowStatus } from "@/lib/firestore/types";

interface DeadlineCountdownProps {
  applicationWindow: ApplicationWindow | undefined;
  status: ApplicationWindowStatus;
}

function daysUntil(dateIso: string, now: Date): number {
  const target = new Date(dateIso).getTime();
  return Math.ceil((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function DeadlineCountdown({ applicationWindow, status }: DeadlineCountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  if (!now) return null;

  if (status === "open" && applicationWindow) {
    const effectiveClose = applicationWindow.lateClosesOn ?? applicationWindow.closesOn;
    if (effectiveClose) {
      const days = daysUntil(effectiveClose, now);
      if (days >= 0) {
        const urgent = days <= 7;
        return (
          <span
            className={`no-print inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm transition-colors ${
              urgent 
                ? "bg-mark-red/10 text-mark-red border border-mark-red/20 animate-pulse" 
                : "bg-white text-ink border border-line"
            }`}
          >
            <Hourglass className="h-4 w-4 shrink-0" aria-hidden="true" />
            {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
          </span>
        );
      }
    }
  }

  if (status === "openingSoon" && applicationWindow?.opensOn) {
    const days = daysUntil(applicationWindow.opensOn, now);
    if (days >= 0) {
      return (
        <span className="no-print inline-flex shrink-0 items-center gap-2 rounded-xl bg-mark-green/10 px-3 py-1.5 text-xs font-bold tracking-wide text-mark-green border border-mark-green/20 shadow-sm">
          <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
          Opens in {days}d
        </span>
      );
    }
  }

  if (status === "unknown") {
    return (
      <span className="no-print inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold tracking-wide text-ink-soft border border-line shadow-sm">
        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
        Verifying Dates
      </span>
    );
  }

  return null;
}