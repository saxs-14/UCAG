"use client";

import { useRef } from "react";

const MAX_TILT_DEG = 6;

/**
 * A real 3D tilt on hover, tracked to cursor position -- perspective +
 * rotateX/rotateY driven by where the pointer actually is over the
 * card, not a canned CSS-only hover transform. Pure transform/opacity
 * (GPU-composited, no layout cost) and gated on prefers-reduced-motion
 * itself (rather than relying only on the global animation-duration
 * override, since this is a continuous pointermove handler, not a
 * one-shot CSS animation) -- readers who've asked for less motion get
 * a perfectly normal static card, not a jittery near-instant one.
 */
export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotionRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ px: number; py: number } | null>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotionRef.current || e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    pendingRef.current = { px, py };
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingRef.current;
      if (!pending || !el) return;
      el.style.transform = `perspective(800px) rotateX(${(-pending.py * MAX_TILT_DEG).toFixed(2)}deg) rotateY(${(pending.px * MAX_TILT_DEG).toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    });
  }

  function handlePointerLeave() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingRef.current = null;
    const el = ref.current;
    if (el) el.style.transform = "";
  }

  function handlePointerEnter() {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  return (
    <div
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`transition-transform duration-150 ease-out [transform-style:preserve-3d] ${className}`}
    >
      {children}
    </div>
  );
}
