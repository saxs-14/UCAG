"use client";

import { useMemo, useState } from "react";
import { calculateDetailedReadiness } from "@/lib/readiness";
import type { ApplicationWindow } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface ReadinessScorecardProps {
  matchResult: MatchResult;
  checkedItemIds: ReadonlySet<string>;
  applicationWindow?: ApplicationWindow | null;
}

export function ReadinessScorecard({ matchResult, checkedItemIds, applicationWindow }: ReadinessScorecardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const scorecard = useMemo(
    () => calculateDetailedReadiness(matchResult, checkedItemIds, applicationWindow),
    [matchResult, checkedItemIds, applicationWindow]
  );

  return (
    <div className="no-print w-full rounded-2xl border border-line bg-paper-raised p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between border-b border-line/60 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal text-lg">📋</span>
          <span className="font-display text-lg font-bold text-ink">Application Readiness</span>
        </div>
        <span
          className={`inline-flex items-center justify-center rounded-xl px-4 py-1.5 font-mono text-sm font-black shadow-sm ${
            scorecard.overallScore >= 80 ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : scorecard.overallScore >= 50 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-rose-100 text-rose-800 border border-rose-200"
          }`}
        >
          {scorecard.overallScore}% Ready
        </span>
      </div>

      <p className="mt-3 text-xs font-medium leading-relaxed text-ink-soft">
        A helpful planning aid based on your marks, checklist, and verified dates. (Not an official institutional score.)
      </p>

      <button
        type="button"
        onClick={() => setShowDetails((value) => !value)}
        aria-expanded={showDetails}
        className="mt-4 flex min-h-12 w-full items-center justify-between rounded-xl border-2 border-line bg-white px-5 text-sm font-bold text-ink transition-colors hover:border-brand-teal/50 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
      >
        <span>{showDetails ? "Hide Scorecard Breakdown" : "View Scorecard Breakdown"}</span>
        <span aria-hidden className={`transition-transform duration-300 ${showDetails ? "rotate-180 text-brand-teal" : "text-ink-soft"}`}>▼</span>
      </button>

      {showDetails && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {scorecard.categories.map((cat) => (
            <div key={cat.id} className="flex flex-col gap-2 rounded-2xl bg-white p-4 border border-line/50 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="font-bold text-ink text-sm">{cat.name}</span>
                <span className="font-mono text-xs font-black text-ink-soft shrink-0">{cat.score}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    cat.score >= 80 ? "bg-emerald-500" : cat.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className="mt-1 text-xs font-medium text-ink-soft line-clamp-2">{cat.statusText}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}