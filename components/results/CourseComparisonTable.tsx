import type { ReactNode } from "react";
import type { Programme } from "@/lib/firestore/types";

interface ComparisonRow {
  label: string;
  numeric?: boolean;
  render: (programme: Programme) => ReactNode;
}

const ROWS: ComparisonRow[] = [
  { label: "Qualification", render: (p) => p.qualificationType },
  { label: "NQF level", numeric: true, render: (p) => p.nqfLevel },
  { label: "Duration", render: (p) => p.duration },
  { label: "Mode", render: (p) => p.modeOfDelivery ?? "Not on record" },
  { label: "Minimum APS", numeric: true, render: (p) => p.minAps ?? "Not on record" },
  { label: "Career outcomes", render: (p) => p.careerOutcomes?.join(", ") || "Not on record" },
];

/** Up to 3 programmes selected via each ResultCard's "Compare" checkbox
 * (state lives in ResultsSection, since selection spans multiple cards). */
export function CourseComparisonTable({
  programmes,
  onRemove,
}: {
  programmes: Programme[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="no-print overflow-x-auto rounded border border-line bg-paper-raised p-3">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr>
            <th className="py-1 pr-4" />
            {programmes.map((p) => (
              <th key={p.id} className="py-1 pr-4 align-top">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-ink">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(p.id)}
                    aria-label={`Remove ${p.name} from comparison`}
                    className="text-xs text-ink-faint transition-transform duration-150 ease-out hover:text-mark-red active:scale-[0.97]"
                  >
                    &times;
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-line">
              <td className="py-1.5 pr-4 text-xs font-medium uppercase tracking-wide text-ink-faint">
                {row.label}
              </td>
              {programmes.map((p) => (
                <td
                  key={p.id}
                  className={`py-1.5 pr-4 align-top text-ink ${row.numeric ? "font-mono tabular-nums" : ""}`}
                >
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
