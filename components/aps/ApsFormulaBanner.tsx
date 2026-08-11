"use client";

import { useState } from "react";

export function ApsFormulaBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="no-print w-full rounded-2xl border border-teal-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-5 text-white shadow-md">
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300 font-bold text-lg border border-teal-500/30">
            💡
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-base text-white">
                Important: APS Scores Vary by University!
              </h3>
              <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-slate-950">
                Formula Rule
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              There is no single national APS number in South Africa. Each university converts your Matric marks using its own verified formula (e.g. UMP, Wits, UP, UJ, UCT).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="self-start sm:self-center shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-teal-500 active:scale-95 shadow-sm"
        >
          {expanded ? "Hide University Rules ▲" : "Compare University Rules ▼"}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-200 animate-rise-in">
          <p className="font-semibold text-teal-300 mb-3 text-2xs uppercase tracking-wider">
            Official South African University APS Formula Breakdown:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">University of Mpumalanga (UMP)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses 7 subjects total. Life Orientation is counted at <strong>50% weight</strong>.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">Wits University</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses best 7 subjects including LO, plus bonus points for 60%+ in English & Maths.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">University of Pretoria (UP)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses best 6 subjects. <strong>Life Orientation is completely excluded</strong> from total.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">University of Johannesburg (UJ)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Uses 7-point scale. LO is excluded or capped depending on faculty requirements.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-teal-200 block border-b border-white/10 pb-1 mb-1">North-West University (NWU)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Best 6 subjects, Life Orientation excluded. Math Literacy restricted for STEM.
              </p>
            </div>

            <div className="rounded-xl bg-white/5 p-3.5 border border-white/10">
              <span className="font-bold text-slate-200 block border-b border-white/10 pb-1 mb-1">University of Cape Town (UCT)</span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Faculty points score (/600 or /800) using raw percentages, not standard point bands.
              </p>
            </div>
          </div>

          <div className="mt-3.5 rounded-xl bg-teal-500/10 p-3 text-2xs text-teal-200 border border-teal-500/20 flex items-center gap-2">
            <span>🎯</span>
            <span>
              <strong>UCAG Engine Guarantee:</strong> We calculate your exact points per university using their official rules automatically!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
