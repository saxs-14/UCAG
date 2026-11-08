export function PageHero({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <section className="relative isolate w-full overflow-hidden border-b border-line/60 bg-slate-soft/50 py-12 sm:py-16" aria-labelledby="page-hero-title">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 size-72 rounded-full bg-brand-teal/10 blur-3xl" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-teal/20 bg-brand-teal/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-brand-teal shadow-2xs">
          <span aria-hidden="true" className="size-2 rounded-full bg-brand-teal" />
          Your South African Study Journey
        </div>
        <h1 id="page-hero-title" className="max-w-4xl font-display text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl text-base font-medium leading-relaxed text-ink-soft sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}