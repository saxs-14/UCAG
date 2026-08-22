export function PageHero({
  title,
  subtitle,
  compact = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`hero-atmosphere w-full border-b border-white/10 shadow-md ${
        compact ? "py-5" : "py-10"
      }`}
    >
      <div
        className={`mx-auto flex w-full max-w-5xl flex-col px-6 sm:px-8 ${
          compact ? "gap-1.5" : "gap-3"
        }`}
      >
        {!compact && (
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
            <span>🇿🇦 South Africa Matric & University Admission Guide</span>
          </div>
        )}
        <h1
          className={`animate-rise-in font-extrabold tracking-tight text-white leading-tight ${
            compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </h1>
        {subtitle && !compact && (
          <p className="animate-rise-in max-w-2xl text-sm sm:text-base text-teal-100/90 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
