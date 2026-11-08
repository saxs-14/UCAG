"use client";

import { useState } from "react";
import { loTreatmentMessage } from "@/lib/aps/engine";
import { isFactVerified } from "@/lib/firestore/types";
import type { ApsRule, Institution } from "@/lib/firestore/types";
import { ICON_SIZE, LightbulbIcon, TargetIcon } from "@/components/icons/Icon";

interface ApsFormulaBannerProps {
  institutions: Institution[];
  apsRules: ApsRule[];
}

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
    <div className="no-print w-full rounded-3xl border border-brand-teal/20 bg-gradient-to-br from-brand-teal/5 to-paper p-6 shadow-sm transition-all sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal shadow-inner">
            <LightbulbIcon size={ICON_SIZE.md} />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-black text-ink">
                Did you know APS scores vary by university?
              </h3>
              <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-teal">
                Formula Guide
              </span>
            </div>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-ink-soft">
              There is no single national APS number. Each university calculates your score differently! We use their exact official formulas so you don&apos;t have to guess.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 self-start rounded-xl bg-brand-teal px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-teal/30 sm:self-center"
        >
          {expanded ? "Hide Formulas ▲" : "See How It Works ▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-6 animate-in fade-in slide-in-from-top-4 border-t border-line/60 pt-6 duration-300">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
            Official University Formulas
          </p>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {verifiedRules.map((rule) => {
              const institution = institutionsById.get(rule.institutionId)!;
              return (
                <div key={rule.id} className="flex flex-col rounded-2xl border border-line/50 bg-paper-raised p-5 shadow-sm transition-colors hover:border-brand-teal/30">
                  <span className="mb-2 block border-b border-line/50 pb-2 font-display text-lg font-bold text-ink">
                    {institution.shortName || institution.name}
                  </span>
                  <span className="text-xs font-semibold leading-relaxed text-ink-soft">
                    {formulaSummary(rule)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}