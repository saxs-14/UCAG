"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateAps } from "@/lib/aps/engine";
import { matchProgramme } from "@/lib/matching/engine";
import { resolveSubjectLabel } from "@/config/subjects";
import { CircledMark } from "@/components/CircledMark";
import type { SubjectMarkInput } from "@/lib/aps/types";
import type { ApsRule, Institution, Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface ApsImprovementSimulatorProps {
  marks: SubjectMarkInput[];
  /** Real, already-scored entries (components/results/ResultsSection.tsx)
   * -- which institution(s) this simulator can even offer is entirely
   * determined by which institutions have a verified ApsRule on record,
   * same as the main results. */
  scored: { programme: Programme; matchResult: MatchResult }[];
  apsRules: ApsRule[];
  programmes: Programme[];
  institutions: Institution[];
}

/**
 * "What if I improve one subject?" -- a pure what-if recalculation, not a
 * saved/persisted change: reuses lib/aps/engine and lib/matching/engine
 * exactly as ResultsSection does, just against a temporarily-modified
 * copy of the marks array. config/sampleData.ts's fictional
 * SAMPLE_APS_RULE/SAMPLE_PROGRAMMES are gone from this component
 * entirely -- it was the one piece of fake data left wired into the real
 * results page, invisible only because no institution had a verified
 * ApsRule yet to make it render at all. It now uses the SAME real,
 * verified ApsRule and programmes as the scored results above it, and
 * (since APS is calculated per institution, never as one universal
 * number -- docs/MASTER_PROMPT_v2.md sect. 2) is explicitly labelled
 * with that institution's real name, never left generic.
 */
export function ApsImprovementSimulator({
  marks,
  scored,
  apsRules,
  programmes,
  institutions,
}: ApsImprovementSimulatorProps) {
  // Every scored entry belongs to an institution with a verified ApsRule
  // (that's what "scored" means) -- these are the only institutions this
  // simulator can ever offer a formula for.
  const scoredInstitutionIds = useMemo(
    () => Array.from(new Set(scored.map((e) => e.programme.institutionId))),
    [scored]
  );

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(
    scoredInstitutionIds[0] ?? ""
  );

  useEffect(() => {
    if (!scoredInstitutionIds.includes(selectedInstitutionId)) {
      setSelectedInstitutionId(scoredInstitutionIds[0] ?? "");
    }
  }, [scoredInstitutionIds, selectedInstitutionId]);

  const apsRule = apsRules.find((r) => r.institutionId === selectedInstitutionId);
  const institution = institutions.find((i) => i.id === selectedInstitutionId);
  const institutionProgrammes = useMemo(
    () => programmes.filter((p) => p.institutionId === selectedInstitutionId),
    [programmes, selectedInstitutionId]
  );

  const [selectedSubject, setSelectedSubject] = useState<string>(marks[0]?.subjectCode ?? "");
  const [targetMark, setTargetMark] = useState<number>(marks[0]?.percentage ?? 0);
  // Tracks the live entered mark for the selected subject until the
  // learner actually types their own "what if" value -- without this, a
  // lazy useState initializer captures whatever the mark happened to be
  // at the exact render this component first mounted (which can be a
  // mid-keystroke intermediate value, e.g. "8" on the way to "80" while
  // still typing) and never updates again, even as the real form changes.
  const [userEditedTarget, setUserEditedTarget] = useState(false);

  const liveMarkForSelected = marks.find((m) => m.subjectCode === selectedSubject)?.percentage ?? 0;

  useEffect(() => {
    if (!marks.some((m) => m.subjectCode === selectedSubject)) {
      const first = marks[0];
      setSelectedSubject(first?.subjectCode ?? "");
      setTargetMark(first?.percentage ?? 0);
      setUserEditedTarget(false);
      return;
    }
    if (!userEditedTarget) {
      setTargetMark(liveMarkForSelected);
    }
  }, [marks, selectedSubject, liveMarkForSelected, userEditedTarget]);

  const simulatedMarks = useMemo<SubjectMarkInput[]>(() => {
    if (!selectedSubject) return marks;
    return marks.map((m) => (m.subjectCode === selectedSubject ? { ...m, percentage: targetMark } : m));
  }, [marks, selectedSubject, targetMark]);

  const currentApsResult = useMemo(
    () => (apsRule ? calculateAps(apsRule, marks) : null),
    [apsRule, marks]
  );
  const simulatedApsResult = useMemo(
    () => (apsRule ? calculateAps(apsRule, simulatedMarks) : null),
    [apsRule, simulatedMarks]
  );

  const newlyUnlocked = useMemo(() => {
    if (!apsRule) return [];
    return institutionProgrammes.filter((programme) => {
      const before = matchProgramme(programme, apsRule, marks, { catalog: institutionProgrammes }).bucket;
      const after = matchProgramme(programme, apsRule, simulatedMarks, {
        catalog: institutionProgrammes,
      }).bucket;
      return before !== "qualify" && after === "qualify";
    });
  }, [apsRule, institutionProgrammes, marks, simulatedMarks]);

  if (marks.length === 0 || !apsRule || !institution || !currentApsResult || !simulatedApsResult) {
    return null;
  }

  const delta = simulatedApsResult.score - currentApsResult.score;

  function handleSubjectChange(code: string) {
    setSelectedSubject(code);
    setTargetMark(marks.find((m) => m.subjectCode === code)?.percentage ?? 0);
    setUserEditedTarget(false);
  }

  function handleTargetMarkChange(rawValue: string) {
    setUserEditedTarget(true);
    setTargetMark(Math.max(0, Math.min(100, Number(rawValue))));
  }

  return (
    <details className="no-print rounded border border-line bg-paper-raised p-3 text-sm">
      <summary className="cursor-pointer font-semibold text-ink">
        What if I improve a subject?
      </summary>
      <p className="mt-2 text-xs text-ink-faint">
        Scoped to {institution.name}&apos;s formula -- APS is calculated per institution, not as
        one universal number.
      </p>

      {scoredInstitutionIds.length > 1 && (
        <label className="mt-2 flex flex-col gap-1 text-sm text-ink-soft">
          Institution
          <select
            id="aps-simulator-institution"
            name="aps-simulator-institution"
            value={selectedInstitutionId}
            onChange={(e) => setSelectedInstitutionId(e.target.value)}
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink"
          >
            {scoredInstitutionIds.map((id) => (
              <option key={id} value={id}>
                {institutions.find((i) => i.id === id)?.name ?? id}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          Subject
          <select
            id="aps-simulator-subject"
            name="aps-simulator-subject"
            value={selectedSubject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink"
          >
            {marks.map((m) => (
              <option key={m.subjectCode} value={m.subjectCode}>
                {resolveSubjectLabel(m.subjectCode)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          New mark
          <input
            type="number"
            id="aps-simulator-target-mark"
            name="aps-simulator-target-mark"
            min={0}
            max={100}
            value={targetMark}
            onChange={(e) => handleTargetMarkChange(e.target.value)}
            className="w-20 rounded border border-line bg-paper-raised px-2 py-1 font-mono tabular-nums text-ink"
          />
        </label>
        <span className="text-xs text-ink-faint">(currently {liveMarkForSelected}%)</span>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-ink-faint">Current</span>
          <span className="font-mono text-xl font-bold tabular-nums text-ink">
            {currentApsResult.score}
          </span>
        </div>
        <span className="text-ink-faint">&rarr;</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-ink-faint">Simulated</span>
          <span className="font-mono text-xl font-bold tabular-nums text-ink">
            {simulatedApsResult.score}
          </span>
        </div>
        {delta !== 0 && (
          <CircledMark
            value={`${delta > 0 ? "+" : ""}${delta}`}
            variant={delta > 0 ? "qualify" : "almost"}
            size="sm"
            label={`${delta > 0 ? "Gains" : "Loses"} ${Math.abs(delta)} APS points`}
          />
        )}
      </div>

      {newlyUnlocked.length > 0 && (
        <p className="mt-3 rounded bg-mark-green-soft p-2 text-sm text-ink">
          This would unlock: {newlyUnlocked.map((p) => p.name).join(", ")}
        </p>
      )}
    </details>
  );
}
