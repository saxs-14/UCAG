"use client";

import dynamic from "next/dynamic";
import { getVerifiedStatisticsForDataset } from "@/lib/statistics/select";
import { statisticsToCsv } from "@/lib/statistics/csv";
import { useSaveData } from "@/lib/useSaveData";
import { LABELS } from "@/config/labels";
import type { Statistic } from "@/lib/firestore/types";

export interface ChartSpec {
  id: string;
  title: string;
  datasetKey: string;
}

// Recharts is only fetched when this actually renders -- a learner on
// data-saver never triggers it (see the saveData branch below), matching
// the Phase 8 brief's "deferred charts" requirement for low-data mode.
const StatChartCanvas = dynamic(() => import("./StatChartCanvas"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: 240 }} />,
});

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * "If a statistic has no verified source, the chart does not render --
 * it shows 'data pending verification'" (docs/MASTER_PROMPT_v2.md Phase
 * 5). getVerifiedStatisticsForDataset is the enforcement point; this
 * component never sees an unverified record to accidentally chart.
 */
export function StatChart({ spec, allStatistics }: { spec: ChartSpec; allStatistics: Statistic[] }) {
  const saveData = useSaveData();
  const verified = getVerifiedStatisticsForDataset(allStatistics, spec.datasetKey);

  if (verified.length === 0) {
    return (
      <div className="rounded border border-dashed border-line p-4">
        <h3 className="font-semibold text-ink">{spec.title}</h3>
        <p className="mt-2 text-sm text-ink-faint">{LABELS.statistics.pendingVerification}</p>
      </div>
    );
  }

  const chartData = verified.map((s) => ({ name: s.dimension, value: s.value }));
  const first = verified[0]!;
  const sourceLine = LABELS.statistics.sourceLine
    .replace("{publisher}", first.publisher)
    .replace("{year}", String(first.year))
    .replace("{date}", first.verifiedOn);

  return (
    <div className="rounded border border-line bg-paper-raised p-4">
      <h3 className="font-semibold text-ink">{spec.title}</h3>
      {saveData ? (
        <table className="mt-2 w-full text-left text-sm">
          <tbody>
            {chartData.map((row) => (
              <tr key={row.name} className="border-b border-line last:border-0">
                <td className="py-1 pr-3 text-ink-soft">{row.name}</td>
                <td className="py-1 font-mono tabular-nums text-ink">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <StatChartCanvas chartData={chartData} />
      )}
      <div className="mt-2 flex items-center justify-between font-mono text-xs tabular-nums text-ink-faint">
        <a href={first.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {sourceLine}
        </a>
        <button
          type="button"
          onClick={() => downloadCsv(`${spec.datasetKey}.csv`, statisticsToCsv(verified))}
          className="rounded border border-line px-2 py-1 font-sans hover:bg-slate-soft"
        >
          {LABELS.statistics.downloadCsv}
        </button>
      </div>
    </div>
  );
}
