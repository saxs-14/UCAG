interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

export function Logo({ size = 32, showWordmark = true, wordmarkClassName = "", className = "" }: LogoProps) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        aria-hidden="true"
        className="shrink-0 overflow-visible"
      >
        <rect width="256" height="256" rx="64" fill="#0f172a" />
        <g
          className="origin-center transition-transform duration-300 ease-out group-hover:-rotate-6 group-focus-visible:-rotate-6"
          style={{ transformBox: "fill-box" }}
        >
          <path d="M26 110L128 66L230 110L128 154L26 110Z" fill="#00a896" />
          <path d="M90 144H166C166 175 150 199 128 199C106 199 90 175 90 144Z" fill="#00a896" />
          <circle cx="128" cy="90" r="7" fill="#fbbf24" />
          <path d="M128 95L172 163" stroke="#fbbf24" strokeWidth="7" strokeLinecap="round" />
          <circle
            cx="172"
            cy="178"
            r="11"
            fill="#fbbf24"
            className="animate-logo-pulse origin-center"
            style={{ transformBox: "fill-box" }}
          />
        </g>
      </svg>
      {showWordmark && (
        <span className={`font-black tracking-tight ${wordmarkClassName}`}>UCAG</span>
      )}
    </span>
  );
}