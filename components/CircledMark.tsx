const VARIANT_COLOR: Record<"qualify" | "almost" | "neutral", string> = {
  qualify: "text-emerald-600",
  almost: "text-amber-500",
  neutral: "text-slate-500",
};

const SIZE_TEXT: Record<"sm" | "lg", string> = {
  sm: "text-xl",
  lg: "text-4xl",
};

interface CircledMarkProps {
  value: string | number;
  variant?: "qualify" | "almost" | "neutral";
  size?: "sm" | "lg";
  label?: string;
}

const VARIANT_GLOW: Record<"qualify" | "almost" | "neutral", string> = {
  qualify: "#10b981",
  almost: "#f59e0b",
  neutral: "#64748b",
};

const APPROX_PATH_LENGTH = 220;

export function CircledMark({ value, variant = "qualify", size = "lg", label }: CircledMarkProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center px-4 py-2 ${VARIANT_COLOR[variant]} ${
        variant === "qualify" ? "animate-soft-glow rounded-full" : ""
      }`}
      style={{ "--glow-color": VARIANT_GLOW[variant] } as React.CSSProperties}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <path
          className="animate-draw-circle"
          style={{ "--circle-length": APPROX_PATH_LENGTH } as React.CSSProperties}
          d="M10,32 C8,14 30,4 52,5 C78,6 94,16 92,32 C90,50 66,57 46,56 C22,55 6,46 10,32 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={APPROX_PATH_LENGTH}
        />
        <path
          className="animate-draw-circle"
          style={{ "--circle-length": APPROX_PATH_LENGTH, animationDelay: "260ms" } as React.CSSProperties}
          d="M12,30 C11,50 34,58 54,57 C76,56 91,46 89,30 C87,15 68,6 48,7 C26,8 9,16 12,30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={APPROX_PATH_LENGTH}
          opacity="0.6"
        />
      </svg>
      <span className={`relative font-display font-black tabular-nums ${SIZE_TEXT[size]}`}>{value}</span>
    </span>
  );
}