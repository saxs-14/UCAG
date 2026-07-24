/**
 * The signature element from Phase 8's "The Marked Script" design proposal:
 * a number circled the way a teacher circles a total on a marked script --
 * two slightly offset hand-drawn ellipses, not a clean CSS border-radius.
 * Used wherever a number is THE number on screen: the calculator's running
 * APS, a result card's score or gap. Not decorative -- it's how the eye is
 * told which figure decides things.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used.
 */

const VARIANT_COLOR: Record<"qualify" | "almost" | "neutral", string> = {
  qualify: "text-mark-green",
  almost: "text-mark-gold",
  neutral: "text-slate",
};

const SIZE_TEXT: Record<"sm" | "lg", string> = {
  sm: "text-xl",
  lg: "text-4xl",
};

interface CircledMarkProps {
  value: string | number;
  variant?: "qualify" | "almost" | "neutral";
  size?: "sm" | "lg";
  label?: string;
}

export function CircledMark({ value, variant = "qualify", size = "lg", label }: CircledMarkProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center px-3 py-1 ${VARIANT_COLOR[variant]}`}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          d="M10,32 C8,14 30,4 52,5 C78,6 94,16 92,32 C90,50 66,57 46,56 C22,55 6,46 10,32 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M12,30 C11,50 34,58 54,57 C76,56 91,46 89,30 C87,15 68,6 48,7 C26,8 9,16 12,30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.6"
        />
      </svg>
      <span className={`relative font-mono font-bold tabular-nums ${SIZE_TEXT[size]}`}>{value}</span>
    </span>
  );
}
