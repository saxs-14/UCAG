"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateAps } from "@/lib/aps/engine";
import { matchProgramme } from "@/lib/matching/engine";
import { resolveSubjectLabel } from "@/config/subjects";
import { SAMPLE_APS_RULE, SAMPLE_PROGRAMMES } from "@/config/sampleData";
import { CircledMark } from "@/components/CircledMark";
import type { SubjectMarkInput } from "@/lib/aps/types";

/**
 * "What if I improve one subject?" -- a pure what-if recalculation, not a
 * saved/persisted change: reuses lib/aps/engine and lib/matching/engine
 * exactly as ResultsSection does, just against a temporarily-modified
 * copy of the marks array. Scoped to [Sample] Demo University's formula
 * specifically (SAMPLE_APS_RULE) -- APS is per-institution, not one
 * generic number (docs/MASTER_PROMPT_v2.md sect. 2), so this is
 * deliberately labelled as one institution's formula, never as "your
 * APS" in general.
 */
export function ApsImprovementSimulator({ marks }: { marks: SubjectMarkInput[] }) {
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

  const currentApsResult = useMemo(() => calculateAps(SAMPLE_APS_RULE, marks), [marks]);

  const simulatedMarks = useMemo<SubjectMarkInput[]>(() => {
    if (!selectedSubject) return marks;
    return marks.map((m) => (m.subjectCode === selectedSubject ? { ...m, percentage: targetMark } : m));
  }, [marks, selectedSubject, targetMark]);

  const simulatedApsResult = useMemo(
    () => calculateAps(SAMPLE_APS_RULE, simulatedMarks),
    [simulatedMarks]
  );

  const newlyUnlocked = useMemo(() => {
    return SAMPLE_PROGRAMMES.filter((programme) => {
      const before = matchProgramme(programme, SAMPLE_APS_RULE, marks, { catalog: SAMPLE_PROGRAMMES }).bucket;
      const after = matchProgramme(programme, SAMPLE_APS_RULE, simulatedMarks, {
        catalog: SAMPLE_PROGRAMMES,
      }).bucket;
      return before !== "qualify" && after === "qualify";
    });
  }, [marks, simulatedMarks]);

  if (marks.length === 0) return null;

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
        Scoped to [Sample] Demo University&apos;s formula (see config/sampleData.ts) -- APS is
        calculated per institution, not as one universal number.
      </p>

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
