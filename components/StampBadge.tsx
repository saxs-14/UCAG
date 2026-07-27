/**
 * A small hand-drawn "verified" tick -- the same double-offset-ellipse
 * technique as CircledMark (this app's actual signature element, a
 * teacher circling a mark), scaled down into a corner stamp. Replaces
 * the flat colored left-border that used to mark bursary/internship/
 * stat cards -- a decorative accent bar says nothing, this literally
 * repeats the app's one real promise ("verified, not guessed") on
 * every single card, every time.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used.
 */

const VARIANT_COLOR: Record<"teal" | "coral" | "green", string> = {
  teal: "text-brand-teal",
  coral: "text-brand-coral",
  green: "text-mark-green",
};

interface StampBadgeProps {
  variant?: "teal" | "coral" | "green";
  rotate?: number;
  label?: string;
}

export function StampBadge({ variant = "teal", rotate = -8, label = "Verified" }: StampBadgeProps) {
  return (
    <span
      className={`animate-stamp-in relative inline-flex h-9 w-9 shrink-0 items-center justify-center ${VARIANT_COLOR[variant]}`}
      style={{ "--stamp-rotate": `${rotate}deg` } as React.CSSProperties}
      role="img"
      aria-label={label}
    >
      <svg aria-hidden="true" viewBox="0 0 40 40" className="absolute inset-0 h-full w-full overflow-visible">
        <ellipse
          cx="20"
          cy="20"
          rx="17"
          ry="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          transform="rotate(-4 20 20)"
        />
        <ellipse
          cx="20.5"
          cy="19.5"
          rx="15.5"
          ry="16.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.6"
          transform="rotate(3 20 20)"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="relative h-4 w-4">
        <path
          d="M4 13l4.5 5L20 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
