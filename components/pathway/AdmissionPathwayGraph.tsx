"use client";

import { useMemo, useState } from "react";
import { resolveSubjectLabel } from "@/config/subjects";
import { reasonText } from "../results/reasonText";
import type { SubjectMarkInput } from "@/lib/aps/types";
import type { Institution, Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface ScoredEntry {
  programme: Programme;
  matchResult: MatchResult;
}

interface AdmissionPathwayGraphProps {
  marks: SubjectMarkInput[];
  scored: ScoredEntry[];
  institutions: Institution[];
}

export function AdmissionPathwayGraph({ marks, scored, institutions }: AdmissionPathwayGraphProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "qualify" | "almostQualify" | "notYet">("all");
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, { institution: Institution; qualify: ScoredEntry[]; almostQualify: ScoredEntry[]; notYet: ScoredEntry[]; }>();
    for (const entry of scored) {
      const instId = entry.programme.institutionId;
      const inst = institutions.find((i) => i.id === instId);
      if (!inst) continue;
      if (!map.has(instId)) map.set(instId, { institution: inst, qualify: [], almostQualify: [], notYet: [] });
      map.get(instId)![entry.matchResult.bucket].push(entry);
    }
    return Array.from(map.values());
  }, [scored, institutions]);

  if (marks.length === 0 || scored.length === 0) return null;

  const activeNodes = grouped.filter((g) => activeInstitutionId === null || g.institution.id === activeInstitutionId);

  return (
    <div className="no-print w-full rounded-3xl border border-line bg-paper-raised p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 border-b border-line/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-2xl font-black text-ink">Admission Pathway Graph</h3>
          <p className="mt-1 text-sm font-medium text-ink-soft">A map of your academic future based on your NSC subjects.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: `All Outcomes (${scored.length})`, colors: "bg-slate-100 text-ink hover:bg-slate-200" },
            { id: "qualify", label: "Qualified", colors: "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" },
            { id: "almostQualify", label: "Near-Miss", colors: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100" }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as "all" | "qualify" | "almostQualify" | "notYet")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-4 focus:ring-brand-teal/20 ${selectedCategory === cat.id ? "shadow-md scale-105" : "opacity-70 hover:opacity-100"} ${cat.colors}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {grouped.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-ink-soft mr-2">Filter by University:</span>
          <button
            onClick={() => setActiveInstitutionId(null)}
            className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${activeInstitutionId === null ? "bg-ink text-white shadow-md" : "bg-paper border border-line text-ink-soft hover:bg-slate-50 hover:text-ink"}`}
          >
            All ({grouped.length})
          </button>
          {grouped.map(({ institution }) => (
            <button
              key={institution.id}
              onClick={() => setActiveInstitutionId(institution.id)}
              className={`rounded-lg px-3 py-1.5 font-bold transition-colors ${activeInstitutionId === institution.id ? "bg-brand-teal text-white shadow-md" : "bg-paper border border-line text-ink-soft hover:bg-slate-50 hover:text-ink"}`}
            >
              {institution.shortName || institution.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-teal to-teal-700 font-display text-xl font-black text-white shadow-lg">
            YOU
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-ink">Academic Profile</span>
            <span className="text-sm font-medium text-ink-soft">
              {marks.length} Subjects captured ({marks.map((m) => resolveSubjectLabel(m.subjectCode)).join(", ")})
            </span>
          </div>
        </div>

        <div className="ml-8 h-8 w-1 rounded-full bg-line/60" />

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {activeNodes.map(({ institution, qualify, almostQualify, notYet }) => {
            const renderQualify = (selectedCategory === "all" || selectedCategory === "qualify") ? qualify : [];
            const renderAlmost = (selectedCategory === "all" || selectedCategory === "almostQualify") ? almostQualify : [];
            const renderNotYet = (selectedCategory === "all" || selectedCategory === "notYet") ? notYet : [];

            if (!renderQualify.length && !renderAlmost.length && !renderNotYet.length) return null;

            return (
              <div key={institution.id} className="flex flex-col gap-4 rounded-2xl border-2 border-line/50 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center justify-between border-b border-line/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-brand-teal shadow-inner" />
                    <span className="font-display text-lg font-bold text-ink">{institution.shortName || institution.name}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">{institution.province}</span>
                </div>

                {renderQualify.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600">✓ Qualified ({renderQualify.length})</span>
                    {renderQualify.map(({ programme }) => (
                      <div key={programme.id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-ink">
                        <span className="font-bold">{programme.name}</span>
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">APS {programme.minAps}+</span>
                      </div>
                    ))}
                  </div>
                )}

                {renderAlmost.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-600">! Near-Miss ({renderAlmost.length})</span>
                    {renderAlmost.map(({ programme, matchResult }) => (
                      <div key={programme.id} className="flex flex-col gap-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-sm text-ink">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{programme.name}</span>
                          <span className="font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">APS {programme.minAps}</span>
                        </div>
                        {matchResult.unmetReasons.length > 0 && (
                          <span className="text-xs font-semibold text-amber-700 bg-white px-2 py-1 rounded border border-amber-200">
                            Shortfall: {reasonText(matchResult.unmetReasons[0]!)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {renderNotYet.length > 0 && (
                  <div className="mt-2 rounded-xl bg-slate-50 p-3 text-center">
                    <span className="text-xs font-bold text-ink-soft">
                      Alternative Route Available ({renderNotYet.length})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}