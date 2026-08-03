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

const GRADIENT_ID = "ucag-logo-gradient";

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
        viewBox="0 0 40 40"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-brand-teal)" />
            <stop offset="45%" stopColor="var(--color-mark-green)" />
            <stop offset="75%" stopColor="var(--color-mark-gold)" />
            <stop offset="100%" stopColor="var(--color-brand-coral)" />
          </linearGradient>
        </defs>
        <path
          className="animate-draw-circle-fast"
          style={{ "--circle-length": 70 } as React.CSSProperties}
          d="M 10.1,29.9 A 14,14 0 1 1 29.9,29.9"
          fill="none"
          stroke={`url(#${GRADIENT_ID})`}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={70}
        />
        <circle cx="32.9" cy="14.6" r="3" fill="var(--color-brand-coral)" />
      </svg>
      {showWordmark && (
        <span className={`font-bold tracking-tight ${wordmarkClassName}`}>UCAG</span>
      )}
    </span>
  );
}
