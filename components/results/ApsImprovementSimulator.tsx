"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateAps } from "@/lib/aps/engine";
import { matchProgramme } from "@/lib/matching/engine";
import { resolveApsRule } from "@/lib/matching/resolveApsRule";
import { resolveSubjectLabel } from "@/config/subjects";
import type { SubjectMarkInput } from "@/lib/aps/types";
import type { ApsRule, Institution, Programme } from "@/lib/firestore/types";
import type { MatchResult } from "@/lib/matching/types";

interface ApsImprovementSimulatorProps {
  marks: SubjectMarkInput[];
  scored: { programme: Programme; matchResult: MatchResult }[];
  apsRules: ApsRule[];
  programmes: Programme[];
  institutions: Institution[];
}

export function ApsImprovementSimulator({
  marks,
  scored,
  apsRules,
  programmes,
  institutions,
}: ApsImprovementSimulatorProps) {
  const scoredInstitutionIds = useMemo(() => Array.from(new Set(scored.map((e) => e.programme.institutionId))), [scored]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(scoredInstitutionIds[0] ?? "");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!scoredInstitutionIds.includes(selectedInstitutionId)) setSelectedInstitutionId(scoredInstitutionIds[0] ?? "");
  }, [scoredInstitutionIds, selectedInstitutionId]);

  const apsRule = apsRules.find((r) => r.institutionId === selectedInstitutionId && r.facultyId === null);
  const institution = institutions.find((i) => i.id === selectedInstitutionId);
  const institutionProgrammes = useMemo(() => programmes.filter((p) => p.institutionId === selectedInstitutionId), [programmes, selectedInstitutionId]);

  const [selectedSubject, setSelectedSubject] = useState<string>(marks[0]?.subjectCode ?? "");
  const [targetMark, setTargetMark] = useState<number>(marks[0]?.percentage ?? 0);
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
    if (!userEditedTarget) setTargetMark(liveMarkForSelected);
  }, [marks, selectedSubject, liveMarkForSelected, userEditedTarget]);

  const simulatedMarks = useMemo<SubjectMarkInput[]>(() => {
    if (!selectedSubject) return marks;
    return marks.map((m) => (m.subjectCode === selectedSubject ? { ...m, percentage: targetMark } : m));
  }, [marks, selectedSubject, targetMark]);

  const currentApsResult = useMemo(() => (apsRule ? calculateAps(apsRule, marks) : null), [apsRule, marks]);
  const simulatedApsResult = useMemo(() => (apsRule ? calculateAps(apsRule, simulatedMarks) : null), [apsRule, simulatedMarks]);

  const newlyUnlocked = useMemo(() => {
    return institutionProgrammes.filter((programme) => {
      const programmeRule = resolveApsRule(apsRules, programme.institutionId, programme.facultyId);
      if (!programmeRule) return false;
      const before = matchProgramme(programme, programmeRule, marks, { catalog: institutionProgrammes }).bucket;
      const after = matchProgramme(programme, programmeRule, simulatedMarks, { catalog: institutionProgrammes }).bucket;
      return before !== "qualify" && after === "qualify";
    });
  }, [apsRules, institutionProgrammes, marks, simulatedMarks]);

  if (marks.length === 0 || !apsRule || !institution || !currentApsResult || !simulatedApsResult) return null;

  const delta = simulatedApsResult.score - currentApsResult.score;

  function handleTargetMarkChange(rawValue: string) {
    setUserEditedTarget(true);
    setTargetMark(Math.max(0, Math.min(100, Number(rawValue))));
  }

  return (
    <div className="no-print overflow-hidden rounded-3xl border border-brand-teal/20 bg-gradient-to-b from-brand-teal/5 to-white shadow-sm transition-all hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-6 focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-teal text-2xl shadow-lg shadow-brand-teal/30">
            📈
          </div>
          <div>
            <h3 className="font-display text-lg font-black text-ink">What if I improve a subject?</h3>
            <p className="text-sm font-medium text-ink-soft">Test how boosting a mark impacts your APS.</p>
          </div>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-transform duration-300 border border-line/50 ${expanded ? "rotate-180 bg-brand-teal/10 text-brand-teal" : ""}`}>
          ▼
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line/50 p-6">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line/60 bg-paper p-5 sm:flex-row sm:items-end">
            {scoredInstitutionIds.length > 1 && (
              <label className="flex flex-1 flex-col gap-2 text-sm font-bold text-ink-soft">
                University Formula
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  className="h-12 w-full rounded-xl border border-line/60 bg-white px-3 font-semibold text-ink focus:border-brand-teal focus:ring-brand-teal"
                >
                  {scoredInstitutionIds.map((id) => (
                    <option key={id} value={id}>{institutions.find((i) => i.id === id)?.name ?? id}</option>
                  ))}
                </select>
              </label>
            )}
            
            <label className="flex flex-1 flex-col gap-2 text-sm font-bold text-ink-soft">
              Target Subject
              <select
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); setTargetMark(marks.find((m) => m.subjectCode === e.target.value)?.percentage ?? 0); setUserEditedTarget(false); }}
                className="h-12 w-full rounded-xl border border-line/60 bg-white px-3 font-semibold text-ink focus:border-brand-teal focus:ring-brand-teal"
              >
                {marks.map((m) => (
                  <option key={m.subjectCode} value={m.subjectCode}>{resolveSubjectLabel(m.subjectCode)} (Now: {m.percentage}%)</option>
                ))}
              </select>
            </label>

            <label className="flex w-full sm:w-32 flex-col gap-2 text-sm font-bold text-ink-soft">
              New Mark %
              <input
                type="number"
                min={0}
                max={100}
                value={targetMark}
                onChange={(e) => handleTargetMarkChange(e.target.value)}
                className="h-12 w-full rounded-xl border-2 border-brand-teal/50 bg-white px-3 text-center font-mono text-lg font-bold text-brand-teal focus:border-brand-teal focus:ring-brand-teal"
              />
            </label>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border-2 border-brand-teal/20 bg-white py-8 sm:flex-row sm:gap-12">
            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs font-black uppercase tracking-widest text-ink-soft">Current APS</span>
              <span className="font-mono text-4xl font-black text-slate-400">{currentApsResult.score}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl text-slate-300">→</span>
              {delta !== 0 && (
                <span className={`rounded-full px-3 py-1 font-mono text-xs font-bold ${delta > 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {delta > 0 ? "+" : ""}{delta}
                </span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <span className="mb-2 text-xs font-black uppercase tracking-widest text-brand-teal">Simulated APS</span>
              <span className="font-mono text-5xl font-black text-brand-teal">{simulatedApsResult.score}</span>
            </div>
          </div>

          {newlyUnlocked.length > 0 && (
            <div className="mt-6 animate-rise-in rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 font-display text-lg font-bold text-emerald-800">
                <span>🔓</span> This score unlocks {newlyUnlocked.length} new programmes!
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {newlyUnlocked.map((p) => (
                  <span key={p.id} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm border border-emerald-100">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}