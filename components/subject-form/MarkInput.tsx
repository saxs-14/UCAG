"use client";

import { percentageToPoints } from "@/lib/aps/bands";
import { STANDARD_NSC_SCALE } from "@/config/aps-scales";

interface MarkInputProps {
  label: string;
  percentage: number | null;
  onChange: (percentage: number | null) => void;
  disabled?: boolean;
}

/**
 * Percentage is always the source of truth (some institutions calculate
 * on raw percentages, not point bands -- docs/MASTER_PROMPT_v2.md sect.
 * 2.1). The level shown here is the STANDARD scale for orientation only;
 * it is NOT necessarily what any given institution will use -- that's
 * decided per-institution by lib/aps/engine.ts once a real, verified
 * apsRules record exists (Phase 4).
 */
export function MarkInput({ label, percentage, onChange, disabled }: MarkInputProps) {
  let level: number | null = null;
  if (percentage !== null && percentage >= 0 && percentage <= 100) {
    level = percentageToPoints(percentage, STANDARD_NSC_SCALE);
  }

  return (
    <div className="flex items-center gap-3">
      <label className="w-40 shrink-0 text-sm font-medium" htmlFor={`mark-${label}`}>
        {label}
      </label>
      <input
        id={`mark-${label}`}
        type="number"
        min={0}
        max={100}
        inputMode="numeric"
        disabled={disabled}
        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:disabled:bg-gray-800"
        value={percentage ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(null);
            return;
          }
          const parsed = Number(raw);
          if (Number.isFinite(parsed)) {
            onChange(Math.max(0, Math.min(100, parsed)));
          }
        }}
      />
      <span className="text-sm text-gray-500">%</span>
      {level !== null && (
        <span
          className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          title="Standard NSC scale, for orientation only -- not necessarily what a given institution uses"
        >
          Level {level}
        </span>
      )}
    </div>
  );
}
