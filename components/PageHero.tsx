export function PageHero({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div className="hero-atmosphere w-full border-b border-white/10 py-10 shadow-md">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3.5 py-1 text-xs font-semibold text-teal-200 border border-teal-400/30 w-fit">
          <span>🇿🇦 South Africa Matric & University Admission Guide</span>
        </div>
        <h1 className="animate-rise-in text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="animate-rise-in max-w-2xl text-sm sm:text-base text-teal-100/90 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
