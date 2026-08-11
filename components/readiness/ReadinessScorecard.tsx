"use client";

import { useMemo } from "react";
import { calculateDetailedReadiness } from "@/lib/readiness";
import type { ApplicationWindow } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface ReadinessScorecardProps {
  matchResult: MatchResult;
  checkedItemIds: ReadonlySet<string>;
  applicationWindow?: ApplicationWindow | null;
}

export function ReadinessScorecard({
  matchResult,
  checkedItemIds,
  applicationWindow,
}: ReadinessScorecardProps) {
  const scorecard = useMemo(
    () => calculateDetailedReadiness(matchResult, checkedItemIds, applicationWindow),
    [matchResult, checkedItemIds, applicationWindow]
  );

  return (
    <div className="no-print w-full rounded-md border border-line bg-paper p-3 text-xs">
      <div className="flex items-center justify-between border-b border-line/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink">Application Readiness</span>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-2xs font-bold ${
              scorecard.overallScore >= 80
                ? "bg-mark-green-soft text-mark-green"
                : scorecard.overallScore >= 50
                  ? "bg-mark-amber-soft text-mark-amber"
                  : "bg-mark-red-soft text-mark-red"
            }`}
          >
            {scorecard.overallScore}% Ready
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {scorecard.categories.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-1 rounded bg-paper-raised p-2 border border-line/40">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink truncate">{cat.name}</span>
              <span className="font-mono text-2xs font-bold text-ink-soft">{cat.score}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-overlay">
              <div
                className={`h-full transition-all duration-300 ${
                  cat.score >= 80 ? "bg-mark-green" : cat.score >= 50 ? "bg-mark-amber" : "bg-mark-red"
                }`}
                style={{ width: `${cat.score}%` }}
              />
            </div>
            <span className="text-2xs text-ink-faint truncate">{cat.statusText}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
