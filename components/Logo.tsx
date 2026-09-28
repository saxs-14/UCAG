/**
 * UCAG's logomark: a flat, geometric mortarboard (graduation cap) --
 * designed in Figma (https://www.figma.com/design/TFzgEBmTyiblRmfCEJ9imC)
 * against the app's real semantic tokens (brand-navy, brand-teal,
 * mark-gold -- no new palette introduced). Replaces an earlier abstract
 * progress-ring mark that, per direct feedback, didn't read as
 * "university" at a glance -- a mortarboard says it immediately, kept
 * flat and geometric (no 3D bevels, no pillars, no starburst) so it
 * doesn't repeat the original logo's generic-clip-art problem either.
 *
 * Interactive by design (not just static): the tassel's weighted end
 * breathes gently at rest, and the whole cap tips slightly on
 * hover/focus -- a real mortarboard's tassel swings, so this motion is
 * motivated by the object itself, not decoration for its own sake. Pure
 * CSS (group-hover + a globals.css keyframe), so this stays a server
 * component -- no client-side JS needed for the motion -- and
 * prefers-reduced-motion is already handled globally.
 *
 * `size` controls the mark only; the wordmark next to it is plain text
 * so it always matches surrounding type (never a separate logotype font
 * to keep loading).
 */

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

export function Logo({ size = 32, showWordmark = true, wordmarkClassName = "", className = "" }: LogoProps) {
  return (
    <span className={`group inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <rect width="256" height="256" rx="56" fill="#102A43" />
        <g
          className="origin-center transition-transform duration-300 ease-out group-hover:-rotate-6 group-focus-visible:-rotate-6"
          style={{ transformBox: "fill-box" }}
        >
          <path d="M26 110L128 66L230 110L128 154L26 110Z" fill="#0F766E" />
          <path d="M90 144H166C166 175 150 199 128 199C106 199 90 175 90 144Z" fill="#0F766E" />
          <circle cx="128" cy="90" r="7" fill="#B45309" />
          <path d="M128 95L172 163" stroke="#B45309" strokeWidth="7" strokeLinecap="round" />
          <circle
            cx="172"
            cy="178"
            r="11"
            fill="#B45309"
            className="animate-logo-pulse origin-center"
            style={{ transformBox: "fill-box" }}
          />
        </g>
      </svg>
      {showWordmark && (
        <span className={`font-bold tracking-tight ${wordmarkClassName}`}>UCAG</span>
      )}
    </span>
  );
}
