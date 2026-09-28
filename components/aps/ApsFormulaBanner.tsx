"use client";

import { useState } from "react";
import { loTreatmentMessage } from "@/lib/aps/engine";
import { isFactVerified } from "@/lib/firestore/types";
import type { ApsRule, Institution } from "@/lib/firestore/types";
import { LightbulbIcon, TargetIcon } from "@/components/icons/Icon";

interface ApsFormulaBannerProps {
  institutions: Institution[];
  apsRules: ApsRule[];
}

/**
 * Every claim here traces back to a real ApsRule document -- the same
 * verified, sourced records lib/matching/resolveApsRule.ts already uses to
 * score each programme (see ResultCard's "Formula" chip). This used to
 * hardcode six universities' formulas directly in JSX with no sourceUrl or
 * verifiedOn at all, which broke CLAUDE.md's core rule ("unverified is
 * displayed as unverified, never as a fact") -- an institution like UJ,
 * whose programme catalogue never got seeded, still had a confident-sounding
 * claim here. Now: no verified ApsRule for an institution means no card for
 * it, not a guess dressed up as a fact.
 */
function formulaSummary(rule: ApsRule): string {
  const parts: string[] = [
    `best ${rule.bestNSubjects} subject${rule.bestNSubjects === 1 ? "" : "s"}`,
  ];
  if (rule.extraCountedSubjects.length > 0) {
    parts.push(
      `${rule.extraCountedSubjects.length} subject${rule.extraCountedSubjects.length === 1 ? "" : "s"} counted twice`
    );
  }
  if (rule.divisor) {
    parts.push(`averaged (divided by ${rule.divisor})`);
  }
  return `Uses ${parts.join(", ")}.`;
}

export function ApsFormulaBanner({ institutions, apsRules }: ApsFormulaBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const institutionsById = new Map(institutions.map((i) => [i.id, i]));
  const verifiedRules = apsRules
    .filter(isFactVerified)
    .filter((rule) => institutionsById.has(rule.institutionId))
    .sort((a, b) => {
      const nameCompare = institutionsById
        .get(a.institutionId)!
        .shortName.localeCompare(institutionsById.get(b.institutionId)!.shortName);
      return nameCompare !== 0 ? nameCompare : (a.facultyId ?? "").localeCompare(b.facultyId ?? "");
    });

  if (verifiedRules.length === 0) return null;

  return (
    <div className="no-print w-full rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-5 text-white shadow-md">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <LightbulbIcon size={18} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-white">
                Important: APS Scores Vary by University!
              </h3>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-slate-950">
                Formula Rule
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              There is no single national APS number in South Africa. Each university converts your Matric marks using its own formula -- UCAG shows only the {verifiedRules.length} we&apos;ve independently verified against the institution&apos;s own published source.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="self-start sm:self-center shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-500 active:scale-95 shadow-sm"
        >
          {expanded ? "Hide Verified Formulas ▲" : "Compare Verified Formulas ▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-200 animate-rise-in">
          <p className="font-semibold text-teal-300 mb-3 text-2xs uppercase tracking-wider">
            Verified APS Formula Breakdown:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {verifiedRules.map((rule) => {
              const institution = institutionsById.get(rule.institutionId)!;
              return (
                <div key={rule.id} className="flex flex-col rounded-xl bg-white/5 p-3.5 border border-white/10">
                  <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">
                    {institution.shortName || institution.name}
                  </span>
                  <span className="text-2xs text-slate-400 mb-1.5">{rule.scaleName}</span>
                  <p className="text-2xs text-slate-300 leading-relaxed">
                    {formulaSummary(rule)} {loTreatmentMessage(rule)}
                    {rule.maxScore ? ` Maximum score: ${rule.maxScore}.` : ""}
                  </p>
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-2xs font-mono tabular-nums text-teal-400 underline hover:text-teal-300"
                  >
                    Verified {rule.verifiedOn} · Official Source
                  </a>
                </div>
              );
            })}
          </div>

          <div className="mt-3.5 rounded-xl bg-teal-500/10 p-3 text-2xs text-teal-200 border border-teal-500/20 flex items-center gap-2">
            <TargetIcon size={14} className="shrink-0" />
            <span>
              <strong>UCAG Engine Guarantee:</strong> We calculate your exact points per university using their official, verified rules automatically!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
