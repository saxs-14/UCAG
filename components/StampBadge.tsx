/**
 * A small solid "verified" checkmark badge -- the same kind of clean,
 * crisp verification indicator you'd see on any real institutional or
 * professional site, not a hand-drawn circle. Repeats this app's one
 * real promise ("verified, not guessed") on every card it marks.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used.
 */

const VARIANT_BG: Record<"teal" | "coral" | "green", string> = {
  teal: "bg-brand-teal",
  coral: "bg-brand-coral",
  green: "bg-mark-green",
};

interface StampBadgeProps {
  variant?: "teal" | "coral" | "green";
  label?: string;
}

export function StampBadge({ variant = "teal", label = "Verified" }: StampBadgeProps) {
  return (
    <span
      className={`animate-pop-in inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${VARIANT_BG[variant]}`}
      role="img"
      aria-label={label}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
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
