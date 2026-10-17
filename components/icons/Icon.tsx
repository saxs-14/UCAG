/**
 * Minimal, hand-authored inline SVG icon set -- deliberately not a
 * dependency (no lucide-react/heroicons): this app already has a
 * precedent for bespoke inline SVG (components/CircledMark.tsx's
 * hand-drawn circle paths) rather than pulling in an icon library for a
 * dozen shapes, and the project enforces a strict calculator-route
 * bundle budget (scripts/check-bundle-budget.mjs) that a full icon
 * package would eat into for no real benefit at this scale.
 *
 * Replaces emoji used as functional/structural icons across the
 * highest-traffic components -- emoji render inconsistently across
 * platforms/fonts and can't be styled via currentColor or the design
 * token system the way these can. A genuine flag glyph (South African
 * flag in PageHero) is left alone; that's not a structural icon.
 *
 * Every icon: 20x20 viewBox, 1.75px stroke, round caps/joins -- one
 * consistent visual language. `size` defaults to 16px; pass a
 * className for color (currentColor) and any size override.
 *
 * Sizing is a defined 4-step scale (ICON_SIZE below), not a free number
 * per call site -- every real usage across the app previously picked its
 * own ad hoc pixel value (11, 12, 13, 14, 18, 22 were all in use for
 * contexts that only needed 2-3 genuinely distinct sizes). Pass one of
 * these named constants rather than a raw number for any new usage.
 */

export const ICON_SIZE = {
  /** Tight inline glyphs: checkmarks inside small (~16px) circular
   * badges, close-button icons next to text. */
  xs: 12,
  /** Default size for most inline UI icons -- buttons, chips, result-card
   * badges. Use this unless a specific layout constraint says otherwise. */
  sm: 14,
  /** Icon centered inside a larger (~40px) circular badge, e.g. a modal
   * header icon or a callout's leading icon. */
  md: 20,
  /** Standalone feature icons, not inside a small badge -- e.g. a
   * feature-card's own icon. */
  lg: 26,
} as const;

interface IconProps {
  className?: string;
  size?: number;
}

const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function CheckIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M4 10.5 8 14.5 16 6" />
    </svg>
  );
}

export function XIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M5 5 15 15 M15 5 5 15" />
    </svg>
  );
}

export function MapPinIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M10 18s6-5.5 6-10a6 6 0 1 0-12 0c0 4.5 6 10 6 10Z" />
      <circle cx="10" cy="8" r="2.25" />
    </svg>
  );
}

export function RocketIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M11.5 3.5c2.5 1 4.5 3 5 5.5-2 .3-4.3 1.6-6 3.3-1.7 1.7-3 4-3.3 6-2.5-.5-4.5-2.5-5.5-5 1.7-.5 3.7-1.7 5-3s2.5-3.3 3-5c.5-.5 1.1-.8 1.8-1.8Z" />
      <circle cx="12.5" cy="7.5" r="1.25" />
      <path d="M5.5 14.5 3.5 16.5 M7 16l-2 2" />
    </svg>
  );
}

export function HourglassIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M5.5 3h9M5.5 17h9" />
      <path d="M6 3c0 3.5 2 5 4 6-2 1-4 2.5-4 6M14 3c0 3.5-2 5-4 6 2 1 4 2.5 4 6" />
    </svg>
  );
}

export function LightbulbIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M7 15h6M8 17.5h4" />
      <path d="M10 2.5a5 5 0 0 0-3 9c.6.5 1 1.2 1 2h4c0-.8.4-1.5 1-2a5 5 0 0 0-3-9Z" />
    </svg>
  );
}

export function StarIcon({ className, size = 16, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base} width={size} height={size} fill={filled ? "currentColor" : "none"} className={className}>
      <path d="M10 2.5 12.35 7.6l5.65.5-4.3 3.7 1.3 5.5L10 14.6l-4.9 2.7 1.3-5.5-4.3-3.7 5.65-.5Z" />
    </svg>
  );
}

export function RulerIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M3.5 12.5 12.5 3.5l4 4-9 9-4-4Z" />
      <path d="m9.5 6.5 1 1M12 4l1 1M7 9l1 1M14.5 6.5l1 1" />
    </svg>
  );
}

export function SaveIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M4 3h9l3 3v11H4V3Z" />
      <path d="M7 3v5h6V3M6 12h8v5H6v-5Z" />
    </svg>
  );
}

export function CheckCircleIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M6.75 10.25 9 12.5l4.25-5" />
    </svg>
  );
}

export function GraduationCapIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="m2 8 8-3.5L18 8l-8 3.5L2 8Z" />
      <path d="M5.5 9.7V14c0 1 2 2 4.5 2s4.5-1 4.5-2V9.7M18 8v4.5" />
    </svg>
  );
}

export function TargetIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="4" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export function PhoneIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <rect x="6" y="2.5" width="8" height="15" rx="1.75" />
      <path d="M9 14.5h2" />
    </svg>
  );
}

export function BoltIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} fill="currentColor" stroke="none" className={className}>
      <path d="M11 2 4.5 11.5h4L8 18l7-10h-4.2L11 2Z" />
    </svg>
  );
}

export function LockIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.75" />
      <path d="M6.5 9V6a3.5 3.5 0 0 1 7 0v3" />
    </svg>
  );
}

export function DocumentIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M6 2.5h5.5L16 7v10a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 6 17V3a.5.5 0 0 1 0-.5Z" />
      <path d="M11.5 2.5V7H16" />
    </svg>
  );
}

export function ShieldIcon({ className, size = 16 }: IconProps) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      <path d="M10 2.5 16 5v5c0 4-2.5 6.5-6 7.5-3.5-1-6-3.5-6-7.5V5l6-2.5Z" />
      <path d="M7.25 10 9 11.75 12.75 8" />
    </svg>
  );
}
