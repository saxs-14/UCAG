"use client";

import dynamic from "next/dynamic";
import { getVerifiedStatisticsForDataset } from "@/lib/statistics/select";
import { statisticsToCsv } from "@/lib/statistics/csv";
import { useSaveData } from "@/lib/useSaveData";
import { StampBadge } from "@/components/StampBadge";
import { TiltCard } from "@/components/TiltCard";
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
  loading: () => <div className="chart-loading-shell" />,
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
export function StatChart({
  spec,
  allStatistics,
  staggerIndex = 0,
}: {
  spec: ChartSpec;
  allStatistics: Statistic[];
  staggerIndex?: number;
}) {
  const saveData = useSaveData();
  const verified = getVerifiedStatisticsForDataset(allStatistics, spec.datasetKey);
  const stagger = Math.min(staggerIndex + 1, 6);

  if (verified.length === 0) {
    return (
      <div
        className={`stagger-${stagger} animate-pop-in rounded-[28px] border border-brand-amber/20 bg-brand-amber-soft p-4 shadow-sm`}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-amber text-white"
            role="img"
            aria-label="Verification pending"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 7v5l3.5 2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="font-semibold text-ink">{spec.title}</h3>
        </div>
        <p className="text-sm text-ink-soft">{LABELS.statistics.pendingVerification}</p>
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
    <div className={`stagger-${stagger} animate-pop-in`}>
      <TiltCard>
        <div className="elevate rounded-[28px] border border-line bg-paper-raised p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StampBadge variant="green" label="Verified statistic" />
            <h3 className="font-semibold text-ink">{spec.title}</h3>
          </div>
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
              className="min-h-11 rounded-full border border-line px-3 font-sans transition-transform hover-fine:-translate-y-0.5 hover:bg-slate-soft active:scale-95"
            >
              {LABELS.statistics.downloadCsv}
            </button>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
