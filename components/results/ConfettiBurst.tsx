"use client";

import { useMemo } from "react";

/** Only the palette's own "qualify" family -- ties the celebration
 * directly to what's being celebrated rather than a generic rainbow,
 * per the redesign's "motion expresses meaning" rule. */
const COLORS = [
  "var(--color-mark-green)",
  "var(--color-brand-teal)",
  "var(--color-brand-coral)",
  "var(--color-mark-gold)",
];

const PIECE_COUNT = 28;

interface Piece {
  left: number;
  delayMs: number;
  durationMs: number;
  driftPx: number;
  spinDeg: number;
  color: string;
  width: number;
  height: number;
}

/**
 * The one big celebration moment in the app -- fired once by
 * ResultsSection when a learner's results first include a real "You
 * qualify" match. Pure CSS (no canvas/animation library dependency,
 * matching app/globals.css's "small deliberate vocabulary, not a
 * library" motion philosophy). Purely decorative: aria-hidden, and
 * every piece falls back to an instant snap under prefers-reduced-
 * motion via the global override in globals.css -- nothing here needs
 * its own JS reduced-motion check.
 */
export function ConfettiBurst() {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => ({
        left: Math.random() * 100,
        delayMs: Math.random() * 300,
        durationMs: 1800 + Math.random() * 900,
        driftPx: (Math.random() - 0.5) * 160,
        spinDeg: 360 + Math.random() * 360,
        color: COLORS[i % COLORS.length]!,
        width: 6 + Math.random() * 6,
        height: 4 + Math.random() * 6,
      })),
    []
  );

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0 overflow-visible">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 rounded-sm"
          style={
            {
              left: `${p.left}vw`,
              width: p.width,
              height: p.height,
              backgroundColor: p.color,
              animationDelay: `${p.delayMs}ms`,
              "--fall-duration": `${p.durationMs}ms`,
              "--drift": `${p.driftPx}px`,
              "--spin": `${p.spinDeg}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
