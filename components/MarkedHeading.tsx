/**
 * A page/section heading with a hand-drawn underline stroke that draws
 * itself in -- replaces the previous redesign's gradient-text treatment
 * (a named generic/AI-generated pattern) with the same "teacher marking
 * a script" idea CircledMark already established, just applied to a
 * heading instead of a number: solid ink-colored text, then a stroke
 * drawn beneath it like someone underlining the important word.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used.
 */

const COLOR: Record<"teal" | "coral" | "green" | "gold", string> = {
  teal: "var(--color-brand-teal)",
  coral: "var(--color-brand-coral)",
  green: "var(--color-mark-green)",
  gold: "var(--color-mark-gold)",
};

/** Generously overestimated vs. the wave path's true length -- see
 * CircledMark's APPROX_PATH_LENGTH for the same reasoning: the exact
 * number only needs to be >= the real length for the stroke-dashoffset
 * draw-in to look complete, not measured live per instance. */
const APPROX_PATH_LENGTH = 300;

interface MarkedHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2";
  color?: "teal" | "coral" | "green" | "gold";
  className?: string;
}

export function MarkedHeading({ children, as = "h2", color = "teal", className = "" }: MarkedHeadingProps) {
  const Tag = as;
  return (
    <span className="inline-flex flex-col items-start">
      <Tag className={`font-display font-bold tracking-tight text-ink ${className}`}>{children}</Tag>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        className="sketchy -mt-1 h-3 w-full"
        style={{ color: COLOR[color] } as React.CSSProperties}
      >
        <path
          className="animate-draw-circle"
          style={{ "--circle-length": APPROX_PATH_LENGTH } as React.CSSProperties}
          d="M2,9 Q12,3 22,9 T42,9 T62,9 T82,9 T102,9 T122,9 T142,9 T162,9 T182,9 T198,9"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={APPROX_PATH_LENGTH}
        />
      </svg>
    </span>
  );
}
