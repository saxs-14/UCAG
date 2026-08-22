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

/**
 * Live "N days left to apply" / "opens in N days" strip. Pure client-side
 * date math over data ResultCard already receives -- no new data flow.
 * Only ever renders a number when a real ISO date is present; an unknown
 * or missing date renders an explicit "dates being verified" state
 * instead of a blank space, per CLAUDE.md's overriding rule.
 */
export function DeadlineCountdown({ applicationWindow, status }: DeadlineCountdownProps) {
  const [now, setNow] = useState<Date | null>(null);

  // Computed on the client only, after mount -- avoids a server/client
  // render mismatch from "today" differing between server render time and
  // hydration time.
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
            className={`no-print inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-bold uppercase tracking-wide ${
              urgent ? "bg-rose-100 text-rose-800 border border-rose-300" : "bg-slate-100 text-slate-700 border border-slate-300"
            }`}
          >
            <Hourglass className="h-3 w-3 shrink-0" aria-hidden="true" />
            {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left to apply`}
          </span>
        );
      }
    }
  }

  if (status === "openingSoon" && applicationWindow?.opensOn) {
    const days = daysUntil(applicationWindow.opensOn, now);
    if (days >= 0) {
      return (
        <span className="no-print inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-2xs font-bold uppercase tracking-wide text-emerald-800 border border-emerald-300">
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          Opens in {days} day{days === 1 ? "" : "s"}
        </span>
      );
    }
  }

  if (status === "unknown") {
    return (
      <span className="no-print inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-slate-600 border border-slate-300">
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        Dates being verified
      </span>
    );
  }

  return null;
}
