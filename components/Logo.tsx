/**
 * UCAG's logomark: a 270-degree arc gauge, sweeping through the app's
 * own semantic palette (teal -> green -> gold -> coral), with a marker
 * dot near its high end -- a real progress/score gauge, not a generic
 * shield-and-checkmark (which is exactly the "looks like a
 * cybersecurity vendor" problem this pass is fixing). Ties directly to
 * what this app actually does: APS is a score out of a maximum, and
 * "qualify" is a real threshold on a real scale, not an abstract
 * trust/verification badge.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used. `size` controls the mark only; the
 * wordmark next to it is plain text so it always matches surrounding
 * type (never a separate logotype font to keep loading).
 */

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

export function Logo({ size = 32, showWordmark = true, wordmarkClassName = "", className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <rect width="64" height="64" rx="16" fill="#003b5c" />
        {/* University Pillars */}
        <path
          d="M16 50 H48 M20 50 V38 M28 50 V38 M36 50 V38 M44 50 V38 M18 38 H46"
          stroke="#d4af37"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Varsity Graduation Cap / Mortarboard */}
        <path
          d="M32 14 L52 23 L32 32 L12 23 Z"
          fill="#00a896"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 27.5 V35 C20 39 44 39 44 35 V27.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Gold Tassel */}
        <path d="M50 24 V34" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="35.5" r="2" fill="#d4af37" />
      </svg>
      {showWordmark && (
        <span className={`font-bold tracking-tight ${wordmarkClassName}`}>UCAG</span>
      )}
    </span>
  );
}
