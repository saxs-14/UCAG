"use client";

import { useMemo } from "react";
import { reasonText } from "./reasonText";
import type { Institution, Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface SmartBackupPlanProps {
  programme: Programme;
  institution: Institution;
  matchResult: MatchResult;
  allProgrammes: Programme[];
}

export function SmartBackupPlan({
  programme,
  institution,
  matchResult,
  allProgrammes,
}: SmartBackupPlanProps) {
  const alternatives = useMemo(() => {
    return allProgrammes.filter((p) => {
      if (p.id === programme.id) return false;
      const targetTags = programme.fieldTags ?? [];
      const pTags = p.fieldTags ?? [];
      const sameField = pTags.some((tag) => targetTags.includes(tag));
      const pAps = p.minAps ?? 0;
      const targetAps = programme.minAps ?? 0;
      const isLowerTier = pAps < targetAps;
      const isArticulationRoute =
        p.qualificationType === "higherCertificate" || p.qualificationType === "diploma";
      return (sameField || p.institutionId === institution.id) && (isLowerTier || isArticulationRoute);
    });
  }, [programme, institution, allProgrammes]);

  if (matchResult.bucket === "qualify") {
    return null;
  }

  return (
    <div className="no-print mt-3 flex flex-col gap-4 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-sm">
      <div className="flex items-center gap-3 font-display text-lg font-black text-amber-800">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200/50 shadow-sm">🛡️</span>
        Smart Backup Plan
      </div>

      <p className="text-sm font-medium leading-relaxed text-amber-900/80">
        You are close to qualifying for <span className="font-bold text-amber-950">{programme.name}</span>. Don&apos;t give up! Here are ways to bridge the gap:
      </p>

      {matchResult.unmetReasons.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-sm border border-white/40">
          <span className="font-bold text-amber-950 text-sm">Shortfall Analysis:</span>
          <ul className="flex flex-col gap-1.5 pl-2">
            {matchResult.unmetReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-medium text-amber-900/80">
                <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span className="leading-snug">{reasonText(reason)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-bold text-amber-950 text-sm">Recommended Alternative Pathways:</span>
          <div className="flex flex-col gap-2">
            {alternatives.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-amber-200 bg-paper-raised p-3 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <span className="font-bold text-ink text-sm">{alt.name}</span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-soft px-2.5 py-1 font-mono text-xs font-bold text-ink-soft">
                  APS {alt.minAps ?? "N/A"} <span className="font-sans font-medium">({alt.duration})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}