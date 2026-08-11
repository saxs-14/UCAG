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
    <div className="no-print mt-2 flex flex-col gap-2 rounded border border-mark-amber/30 bg-mark-amber-soft/40 p-3 text-xs text-ink">
      <div className="flex items-center gap-1.5 font-semibold text-mark-amber">
        <span>&rarr; Your Smart Backup Plan</span>
      </div>

      <p className="text-xs text-ink-soft">
        You are close to qualifying for <span className="font-semibold text-ink">{programme.name}</span>. Don&apos;t give up -- here is how to bridge the gap:
      </p>

      {/* Shortfall summary */}
      {matchResult.unmetReasons.length > 0 && (
        <div className="flex flex-col gap-1 rounded bg-paper-raised p-2">
          <span className="font-medium text-ink">Shortfall Analysis:</span>
          <ul className="list-disc pl-4 text-ink-soft">
            {matchResult.unmetReasons.map((reason, i) => (
              <li key={i}>{reasonText(reason)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Alternative pathways */}
      {alternatives.length > 0 && (
        <div className="mt-1 flex flex-col gap-1">
          <span className="font-medium text-ink">Recommended Alternative Pathways:</span>
          <div className="flex flex-col gap-1">
            {alternatives.slice(0, 3).map((alt) => (
              <div
                key={alt.id}
                className="flex items-center justify-between rounded bg-paper px-2 py-1 text-2xs"
              >
                <span className="font-medium text-ink truncate">{alt.name}</span>
                <span className="font-mono text-ink-faint">APS {alt.minAps ?? "N/A"} ({alt.duration})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
