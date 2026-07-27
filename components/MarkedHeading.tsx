/**
 * A page/section heading with a short solid accent bar beneath it --
 * institutional identity through color and typographic weight (like
 * CSIR's own heading treatment), not a hand-drawn flourish. Previous
 * pass used an animated wavy SVG underline here; dropped per feedback
 * that the hand-drawn language read as a school notebook, not a real
 * website.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used.
 */

const COLOR: Record<"teal" | "coral" | "green" | "gold", string> = {
  teal: "bg-brand-teal",
  coral: "bg-brand-coral",
  green: "bg-mark-green",
  gold: "bg-mark-gold",
};

interface MarkedHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2";
  color?: "teal" | "coral" | "green" | "gold";
  className?: string;
}

export function MarkedHeading({ children, as = "h2", color = "teal", className = "" }: MarkedHeadingProps) {
  const Tag = as;
  return (
    <span className="inline-flex flex-col items-start gap-1.5">
      <Tag className={`font-bold tracking-tight text-ink ${className}`}>{children}</Tag>
      <span className={`h-1 w-14 rounded-full ${COLOR[color]}`} aria-hidden="true" />
    </span>
  );
}
