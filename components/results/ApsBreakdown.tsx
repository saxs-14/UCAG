import { resolveSubjectLabel } from "@/config/subjects";
import type { ApsResult } from "@/lib/aps/types";

interface ApsBreakdownProps {
  apsResult: ApsResult;
  institutionName: string;
}

/**
 * "Explain my APS" -- expandable per-subject breakdown showing exactly how
 * this card's score was built, using the countedSubjects/droppedSubjects/
 * excludedSubjects/appliedBonuses ApsResult already carries. Pure
 * presentation over data lib/aps/engine.ts already computes -- no new
 * calculation logic.
 */
export function ApsBreakdown({ apsResult, institutionName }: ApsBreakdownProps) {
  const valueUnit = apsResult.formulaType.startsWith("pointBand") ? "points" : "%";

  return (
    <details className="no-print rounded-xl border border-line bg-paper p-3.5 text-sm">
      <summary className="cursor-pointer font-semibold text-ink">
        Explain my APS for {institutionName}
      </summary>

      <p className="mt-2 text-xs text-ink-faint">{apsResult.loTreatmentMessage}</p>

      <table className="mt-3 w-full text-xs">
        <thead>
          <tr className="border-b border-line/60 text-left text-ink-faint">
            <th className="py-1 pr-2 font-semibold">Subject</th>
            <th className="py-1 pr-2 font-semibold">Mark</th>
            <th className="py-1 font-semibold">Counted as</th>
          </tr>
        </thead>
        <tbody>
          {apsResult.countedSubjects.map((subject) => (
            <tr key={subject.subjectCode} className="border-b border-line/30 last:border-0">
              <td className="py-1.5 pr-2 font-medium text-ink">
                {resolveSubjectLabel(subject.subjectCode)}
                {subject.isLifeOrientation && (
                  <span className="ml-1 text-2xs text-ink-faint">(LO)</span>
                )}
              </td>
              <td className="py-1.5 pr-2 font-mono tabular-nums text-ink-soft">
                {subject.percentage}%
              </td>
              <td className="py-1.5 font-mono tabular-nums font-bold text-brand-teal">
                {subject.value} {valueUnit}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-line font-bold text-ink">
            <td className="py-1.5 pr-2" colSpan={2}>
              Total
            </td>
            <td className="py-1.5 font-mono tabular-nums">
              {apsResult.score}
              {apsResult.maxScore ? ` / ${apsResult.maxScore}` : ""}
            </td>
          </tr>
        </tfoot>
      </table>

      {apsResult.droppedSubjects.length > 0 && (
        <p className="mt-2 text-2xs text-ink-faint">
          Not counted (best-{apsResult.countedSubjects.length} rule):{" "}
          {apsResult.droppedSubjects.map((code) => resolveSubjectLabel(code)).join(", ")}
        </p>
      )}
      {apsResult.excludedSubjects.length > 0 && (
        <p className="mt-1 text-2xs text-ink-faint">
          Excluded by {institutionName}&apos;s formula:{" "}
          {apsResult.excludedSubjects.map((code) => resolveSubjectLabel(code)).join(", ")}
        </p>
      )}
      {apsResult.appliedBonuses.length > 0 && (
        <p className="mt-2 rounded-lg bg-purple-100 px-2.5 py-1.5 text-2xs font-semibold text-purple-800 border border-purple-300">
          Bonus applied: {apsResult.appliedBonuses.map((b) => b.description).join(", ")}
        </p>
      )}
      {apsResult.warnings.length > 0 && (
        <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-2xs text-amber-900 border border-amber-200/80">
          {apsResult.warnings.join(" ")}
        </p>
      )}
    </details>
  );
}
