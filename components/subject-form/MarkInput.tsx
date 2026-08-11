"use client";

import { percentageToPoints } from "@/lib/aps/bands";
import { STANDARD_NSC_SCALE } from "@/config/aps-scales";

interface MarkInputProps {
  label: string;
  percentage: number | null;
  onChange: (percentage: number | null) => void;
  disabled?: boolean;
}

const LEVEL_STYLE: Record<number, string> = {
  7: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
  6: "bg-teal-100 text-teal-800 border-teal-300 font-bold",
  5: "bg-purple-100 text-purple-800 border-purple-300 font-semibold",
  4: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
  3: "bg-slate-100 text-slate-700 border-slate-300 font-medium",
  2: "bg-rose-100 text-rose-800 border-rose-300 font-medium",
  1: "bg-rose-100 text-rose-800 border-rose-300 font-medium",
};

export function MarkInput({ label, percentage, onChange, disabled }: MarkInputProps) {
  let level: number | null = null;
  if (percentage !== null && percentage >= 0 && percentage <= 100) {
    level = percentageToPoints(percentage, STANDARD_NSC_SCALE);
  }

  return (
    <div className="flex items-center gap-3">
      <label className="w-44 shrink-0 text-sm font-semibold text-ink" htmlFor={`mark-${label}`}>
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={`mark-${label}`}
          type="number"
          min={0}
          max={100}
          inputMode="numeric"
          disabled={disabled}
          placeholder="%"
          className="h-11 w-22 rounded-xl border-2 border-line bg-paper-raised px-3 text-sm font-mono font-bold tabular-nums text-ink transition-all focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 focus:outline-none disabled:bg-slate-soft"
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
      </div>
      <span className="text-xs font-bold text-ink-faint">%</span>
      {level !== null && (
        <span
          className={`rounded-full border px-3 py-1 text-xs font-mono font-bold shadow-2xs transition-all animate-pop-in ${
            LEVEL_STYLE[level] ?? "bg-slate-100 text-slate-700"
          }`}
          title="Standard NSC Matric Level (1-7). Note: Each university converts percentages to points using its own verified formula."
        >
          NSC Level {level}
        </span>
      )}
    </div>
  );
}
