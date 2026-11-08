import { resolveSubjectLabel } from "@/config/subjects";
import { useState } from "react";
import type { ApsResult } from "@/lib/aps/types";

interface ApsBreakdownProps {
  apsResult: ApsResult;
  institutionName: string;
}

export function ApsBreakdown({ apsResult, institutionName }: ApsBreakdownProps) {
  const [expanded, setExpanded] = useState(false);
  const valueUnit = apsResult.formulaType.startsWith("pointBand") ? "points" : "%";

  return (
    <div className="no-print overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition-all hover:shadow-md">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between bg-slate-soft/50 p-4 focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
      >
        <span className="font-bold text-ink">Explain my APS for {institutionName}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-paper-raised text-ink-soft shadow-sm transition-transform duration-300 ${expanded ? "rotate-180 bg-brand-teal/10 text-brand-teal" : ""}`}>
          ▼
        </span>
      </button>

      {expanded && (
        <div className="border-t border-line/50 bg-paper-raised p-4">
          <p className="text-xs font-medium text-ink-soft">{apsResult.loTreatmentMessage}</p>

          <div className="mt-4 overflow-hidden rounded-xl border border-line/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-soft border-b border-line/60">
                <tr>
                  <th className="py-2.5 pl-4 pr-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Subject</th>
                  <th className="py-2.5 pr-2 text-xs font-bold uppercase tracking-wider text-ink-soft">Mark</th>
                  <th className="py-2.5 pr-4 text-xs font-bold uppercase tracking-wider text-ink-soft text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {apsResult.countedSubjects.map((subject) => (
                  <tr key={subject.subjectCode} className="hover:bg-slate-soft/50 transition-colors">
                    <td className="py-3 pl-4 pr-2 font-semibold text-ink">
                      {resolveSubjectLabel(subject.subjectCode)}
                      {subject.isLifeOrientation && <span className="ml-1.5 rounded-full bg-slate-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-faint">(LO)</span>}
                    </td>
                    <td className="py-3 pr-2 font-mono font-medium text-ink-soft">
                      {subject.percentage}%
                    </td>
                    <td className="py-3 pr-4 font-mono font-bold text-brand-teal text-right text-base">
                      {subject.value}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-brand-teal/5 border-t border-brand-teal/20">
                <tr>
                  <td className="py-3 pl-4 pr-2 font-black text-ink" colSpan={2}>
                    Total APS
                  </td>
                  <td className="py-3 pr-4 font-mono text-lg font-black text-brand-teal text-right">
                    {apsResult.score}
                    {apsResult.maxScore ? <span className="text-xs text-brand-teal/60"> / {apsResult.maxScore}</span> : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {apsResult.droppedSubjects.length > 0 && (
              <p className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                <span className="font-bold text-ink">Not counted (best-{apsResult.countedSubjects.length}):</span>
                {apsResult.droppedSubjects.map((code) => resolveSubjectLabel(code)).join(", ")}
              </p>
            )}
            {apsResult.excludedSubjects.length > 0 && (
              <p className="flex items-center gap-2 text-xs font-medium text-ink-soft">
                <span className="font-bold text-ink">Excluded by {institutionName}:</span>
                {apsResult.excludedSubjects.map((code) => resolveSubjectLabel(code)).join(", ")}
              </p>
            )}
            {apsResult.appliedBonuses.length > 0 && (
              <p className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-violet/20 bg-brand-violet/5 px-3 py-1.5 text-xs font-bold text-brand-violet">
                ✨ Bonus: {apsResult.appliedBonuses.map((b) => b.description).join(", ")}
              </p>
            )}
            {apsResult.warnings.length > 0 && (
              <p className="inline-flex w-fit items-center gap-2 rounded-lg border border-mark-gold/30 bg-mark-gold/10 px-3 py-1.5 text-xs font-bold text-mark-gold">
                ⚠️ {apsResult.warnings.join(" ")}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}