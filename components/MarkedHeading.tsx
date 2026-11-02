const COLOR: Record<"teal" | "coral" | "green" | "gold", string> = {
  teal: "bg-brand-teal",
  coral: "bg-orange-500",
  green: "bg-emerald-500",
  gold: "bg-amber-500",
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
    <span className="inline-flex flex-col items-start gap-2">
      <Tag className={`font-display font-black tracking-tight text-ink ${className}`}>{children}</Tag>
      <span className={`h-1.5 w-16 rounded-full ${COLOR[color]}`} aria-hidden="true" />
    </span>
  );
}