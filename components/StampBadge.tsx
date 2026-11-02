const VARIANT_BG: Record<"teal" | "coral" | "green", string> = {
  teal: "bg-brand-teal",
  coral: "bg-orange-500",
  green: "bg-emerald-500",
};

interface StampBadgeProps {
  variant?: "teal" | "coral" | "green";
  label?: string;
}

export function StampBadge({ variant = "teal", label = "Verified" }: StampBadgeProps) {
  return (
    <span
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white shadow-2xs ${VARIANT_BG[variant]}`}
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