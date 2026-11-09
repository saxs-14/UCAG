import Image from "next/image";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
}

export function Logo({ size = 32, showWordmark = true, wordmarkClassName = "", className = "" }: LogoProps) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/icon-192.png"
        alt={showWordmark ? "" : "UCAG"}
        width={size}
        height={size}
        className="shrink-0 transition-transform duration-300 ease-out group-hover:-rotate-6 group-focus-visible:-rotate-6"
        priority
      />
      {showWordmark && (
        <span className={`font-black tracking-tight ${wordmarkClassName}`}>UCAG</span>
      )}
    </span>
  );
}