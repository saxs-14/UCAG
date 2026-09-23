export function PageHero({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <section className="w-full border-b border-line bg-paper-raised" aria-labelledby="page-hero-title">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 sm:py-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal-soft px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-brand-teal">
          <span aria-hidden>🇿🇦</span>
          South African university guide
        </div>
        <h1 id="page-hero-title" className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl text-sm leading-6 text-ink-soft sm:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
