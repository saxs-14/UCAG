export function PageHero({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-line bg-paper-raised" aria-labelledby="page-hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 size-64 rounded-full bg-brand-teal-soft/70 blur-2xl" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal-soft px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand-teal">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-teal" />
          Your South African study journey
        </div>
        <h1 id="page-hero-title" className="max-w-4xl font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl text-sm leading-7 text-ink-soft sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
