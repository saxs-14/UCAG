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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line/60 bg-white p-4 shadow-sm transition-all hover:border-brand-teal/40">
      <label className="text-sm font-bold text-ink" htmlFor={`mark-${label}`}>
        {label}
      </label>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <input
            id={`mark-${label}`}
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            disabled={disabled}
            placeholder="0-100"
            className="h-12 w-28 rounded-xl border-2 border-line bg-slate-50 px-4 text-base font-mono font-bold tabular-nums text-ink transition-all focus:border-brand-teal focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-teal/20 disabled:bg-slate-100"
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
          <span className="absolute right-3 text-xs font-bold text-ink-faint">%</span>
        </div>
        {level !== null && (
          <span
            className={`rounded-xl border px-3 py-1.5 text-xs font-mono font-bold shadow-sm transition-all animate-pop-in ${
              LEVEL_STYLE[level] ?? "bg-slate-100 text-slate-700"
            }`}
          >
            Level {level}
          </span>
        )}
      </div>
    </div>
  );
}