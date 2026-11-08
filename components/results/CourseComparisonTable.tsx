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

export function CourseComparisonTable({
  programmes,
  onRemove,
}: {
  programmes: Programme[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="no-print overflow-x-auto rounded-3xl border border-line bg-paper-raised p-2 shadow-sm">
      <table className="w-full min-w-max text-left text-sm">
        <thead>
          <tr>
            <th className="w-32 bg-slate-soft rounded-tl-2xl p-4"></th>
            {programmes.map((p) => (
              <th key={p.id} className="p-4 align-top">
                <div className="flex flex-col gap-2 rounded-2xl bg-brand-teal/5 p-4 border border-brand-teal/10">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-base font-bold text-ink leading-tight">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      aria-label={`Remove ${p.name}`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-paper-raised text-ink-faint shadow-sm transition-transform duration-150 hover:bg-mark-red hover:text-white active:scale-[0.97]"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40">
          {ROWS.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-paper-raised" : "bg-slate-soft/50"}>
              <td className="p-4 text-xs font-black uppercase tracking-widest text-ink-soft align-middle">
                {row.label}
              </td>
              {programmes.map((p) => (
                <td
                  key={p.id}
                  className={`p-4 align-middle text-ink font-medium ${row.numeric ? "font-mono font-bold text-brand-teal text-base" : ""}`}
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