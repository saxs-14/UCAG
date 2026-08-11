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

export function AdmissionPathwayGraph({
  marks,
  scored,
  institutions,
}: AdmissionPathwayGraphProps) {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "qualify" | "almostQualify" | "notYet">(
    "all"
  );
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        institution: Institution;
        qualify: ScoredEntry[];
        almostQualify: ScoredEntry[];
        notYet: ScoredEntry[];
      }
    >();

    for (const entry of scored) {
      const instId = entry.programme.institutionId;
      const inst = institutions.find((i) => i.id === instId);
      if (!inst) continue;

      if (!map.has(instId)) {
        map.set(instId, { institution: inst, qualify: [], almostQualify: [], notYet: [] });
      }

      const bucket = entry.matchResult.bucket;
      map.get(instId)![bucket].push(entry);
    }

    return Array.from(map.values());
  }, [scored, institutions]);

  if (marks.length === 0 || scored.length === 0) {
    return null;
  }

  const activeNodes = grouped.filter(
    (g) => activeInstitutionId === null || g.institution.id === activeInstitutionId
  );

  return (
    <div className="no-print w-full rounded-lg border border-line bg-paper-raised p-4 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            Admission Pathway Graph
          </h3>
          <p className="text-xs text-ink-faint">
            Visual map of your possible academic futures based on your verified NSC subjects.
          </p>
        </div>

        {/* Filter controls */}
        <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
              selectedCategory === "all"
                ? "bg-paper-overlay text-ink shadow-xs"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            All Outcomes ({scored.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("qualify")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
              selectedCategory === "qualify"
                ? "bg-mark-green-soft text-mark-green shadow-xs"
                : "text-ink-faint hover:text-mark-green"
            }`}
          >
            Qualified
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory("almostQualify")}
            className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
              selectedCategory === "almostQualify"
                ? "bg-mark-amber-soft text-mark-amber shadow-xs"
                : "text-ink-faint hover:text-mark-amber"
            }`}
          >
            Near-Miss
          </button>
        </div>
      </div>

      {/* Institution quick filters if multiple */}
      {grouped.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-b border-line/40 pb-2 text-xs">
          <span className="text-ink-faint">Filter Institution:</span>
          <button
            type="button"
            onClick={() => setActiveInstitutionId(null)}
            className={`rounded px-2 py-0.5 font-medium transition ${
              activeInstitutionId === null ? "bg-ink text-white" : "bg-paper-overlay text-ink-soft hover:text-ink"
            }`}
          >
            All ({grouped.length})
          </button>
          {grouped.map(({ institution }) => (
            <button
              key={institution.id}
              type="button"
              onClick={() => setActiveInstitutionId(institution.id)}
              className={`rounded px-2 py-0.5 font-medium transition ${
                activeInstitutionId === institution.id ? "bg-ink text-white" : "bg-paper-overlay text-ink-soft hover:text-ink"
              }`}
            >
              {institution.shortName || institution.name}
            </button>
          ))}
        </div>
      )}

      {/* Pathway Node Visualization */}
      <div className="mt-4 flex flex-col gap-6">
        {/* Root Node: LEARNER */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-overlay font-bold text-ink shadow-xs">
            YOU
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink">NSC Academic Profile</span>
            <span className="text-xs text-ink-faint">
              {marks.length} Subjects captured ({marks.map((m) => resolveSubjectLabel(m.subjectCode)).join(", ")})
            </span>
          </div>
        </div>

        {/* Connecting Line */}
        <div className="ml-5 h-6 w-0.5 bg-line" />

        {/* Institution Branches */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {activeNodes.map(({ institution, qualify, almostQualify, notYet }) => {
            const hasQualify = selectedCategory === "all" || selectedCategory === "qualify";
            const hasAlmost = selectedCategory === "all" || selectedCategory === "almostQualify";
            const hasNotYet = selectedCategory === "all" || selectedCategory === "notYet";

            const renderQualify = hasQualify ? qualify : [];
            const renderAlmost = hasAlmost ? almostQualify : [];
            const renderNotYet = hasNotYet ? notYet : [];

            if (renderQualify.length === 0 && renderAlmost.length === 0 && renderNotYet.length === 0) {
              return null;
            }

            return (
              <div
                key={institution.id}
                className="flex flex-col gap-3 rounded-md border border-line bg-paper p-3"
              >
                <div className="flex items-center justify-between border-b border-line/50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ink" />
                    <span className="font-semibold text-ink">{institution.shortName || institution.name}</span>
                  </div>
                  <span className="text-xs text-ink-faint">{institution.province}</span>
                </div>

                {/* Qualify Branch */}
                {renderQualify.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-mark-green">&check; Qualified ({renderQualify.length})</span>
                    {renderQualify.map(({ programme }) => (
                      <div
                        key={programme.id}
                        className="flex items-center justify-between rounded bg-mark-green-soft px-2.5 py-1.5 text-xs text-ink"
                      >
                        <span className="font-medium">{programme.name}</span>
                        <span className="font-mono text-ink-faint">APS {programme.minAps}+</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Almost Qualify Branch */}
                {renderAlmost.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-mark-amber">&excl; Near-Miss ({renderAlmost.length})</span>
                    {renderAlmost.map(({ programme, matchResult }) => (
                      <div
                        key={programme.id}
                        className="flex flex-col gap-1 rounded bg-mark-amber-soft px-2.5 py-1.5 text-xs text-ink"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{programme.name}</span>
                          <span className="font-mono text-ink-faint">APS {programme.minAps}</span>
                        </div>
                        {matchResult.unmetReasons.length > 0 && (
                          <span className="text-2xs text-mark-amber">
                            Shortfall: {reasonText(matchResult.unmetReasons[0]!)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Alternative Route (Not Yet) */}
                {renderNotYet.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-2xs font-semibold text-ink-faint">
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
