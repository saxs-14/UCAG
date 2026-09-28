/**
 * UCAG's logomark: an open progress ring -- shaped like a "U" -- with a
 * summit marker perched at its top. Designed in Figma
 * (https://www.figma.com/design/TFzgEBmTyiblRmfCEJ9imC) against the
 * app's real semantic tokens (brand-navy, brand-teal, mark-gold -- no
 * new palette introduced), replacing a literal graduation-cap-and-
 * pillars mark that read as generic education clip art. The ring
 * deliberately echoes CircledMark's circular score-marker motif already
 * used throughout the results UI: the logo previews the exact visual
 * language a learner sees once they get their APS score circled, rather
 * than an unrelated crest.
 *
 * Interactive by design (not just static): the summit dot breathes
 * gently at rest, and the whole mark tilts on hover/focus. Pure CSS
 * (group-hover + a globals.css keyframe), so this stays a server
 * component -- no client-side JS needed for the motion, and
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
          className="origin-center transition-transform duration-300 ease-out group-hover:rotate-6 group-focus-visible:rotate-6"
          style={{ transformBox: "fill-box" }}
        >
          <path
            d="M79.8196 196.809C65.186 186.562 54.2002 171.917 48.4579 155.001C42.7156 138.085 42.5159 119.778 47.8878 102.741C53.2597 85.7032 63.9234 70.822 78.33 60.2587C92.7366 49.6953 110.136 44 128 44C145.864 44 163.263 49.6953 177.67 60.2587C192.077 70.822 202.74 85.7032 208.112 102.741C213.484 119.778 213.284 138.085 207.542 155.001C201.8 171.917 190.814 186.562 176.18 196.809L161.726 176.166C171.97 168.994 179.66 158.742 183.679 146.901C187.699 135.059 187.839 122.245 184.079 110.318C180.318 98.3922 172.854 87.9754 162.769 80.5811C152.684 73.1867 140.505 69.2 128 69.2C115.495 69.2 103.316 73.1867 93.231 80.5811C83.1464 87.9754 75.6818 98.3922 71.9214 110.318C68.1611 122.245 68.3009 135.059 72.3205 146.901C76.3401 158.742 84.0302 168.994 94.2737 176.166L79.8196 196.809Z"
            fill="#0F766E"
          />
          <circle
            cx="128"
            cy="46"
            r="15"
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
