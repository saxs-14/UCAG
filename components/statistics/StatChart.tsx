"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVerifiedStatisticsForDataset } from "@/lib/statistics/select";
import { statisticsToCsv } from "@/lib/statistics/csv";
import { LABELS } from "@/config/labels";
import type { Statistic } from "@/lib/firestore/types";

export interface ChartSpec {
  id: string;
  title: string;
  datasetKey: string;
}

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
  const verified = getVerifiedStatisticsForDataset(allStatistics, spec.datasetKey);

  if (verified.length === 0) {
    return (
      <div className="rounded border border-dashed border-gray-300 p-4 dark:border-gray-700">
        <h3 className="font-semibold">{spec.title}</h3>
        <p className="mt-2 text-sm text-gray-500">{LABELS.statistics.pendingVerification}</p>
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
    <div className="rounded border border-gray-200 p-4 dark:border-gray-700">
      <h3 className="font-semibold">{spec.title}</h3>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <a href={first.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
          {sourceLine}
        </a>
        <button
          type="button"
          onClick={() => downloadCsv(`${spec.datasetKey}.csv`, statisticsToCsv(verified))}
          className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          {LABELS.statistics.downloadCsv}
        </button>
      </div>
    </div>
  );
}
