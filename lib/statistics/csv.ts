import type { Statistic } from "@/lib/firestore/types";

const CSV_COLUMNS = [
  "dataset",
  "dimension",
  "metric",
  "value",
  "unit",
  "publisher",
  "year",
  "verifiedOn",
  "sourceUrl",
] as const;

function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** "Every dataset downloadable as CSV" (docs/MASTER_PROMPT_v2.md Phase 5).
 * Only ever called on already-verified statistics -- see
 * lib/statistics/select.ts, the gate that runs before this. */
export function statisticsToCsv(statistics: Statistic[]): string {
  const header = CSV_COLUMNS.join(",");
  const rows = statistics.map((s) => CSV_COLUMNS.map((col) => escapeCsvField(s[col])).join(","));
  return [header, ...rows].join("\n");
}
