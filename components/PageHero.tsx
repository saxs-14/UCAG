/**
 * The full-width page-intro band used at the top of every top-level
 * page -- structurally the same idea as CSIR's "OUR MANDATE" section
 * (a solid-color banner stating what the page is, edge to edge, not
 * confined to the content column). Uses the tinted navy rather than
 * the full solid navy the header/footer use, so two full-strength
 * brand-navy bands don't stack directly on top of each other.
 *
 * Pure presentational, no client-side interactivity -- safe as a server
 * component wherever it's used.
 */
export function PageHero({ title, subtitle }: { title: React.ReactNode; subtitle?: React.ReactNode }) {
  return (
    <div className="hero-atmosphere w-full bg-brand-navy-soft">
      <div className="relative mx-auto overflow-hidden rounded-[32px] border border-white/10 bg-brand-navy-soft/90 px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -left-10 top-6 h-24 w-24 rounded-full bg-brand-amber/20 blur-3xl animate-float float-delay-0" />
        <div className="pointer-events-none absolute right-6 bottom-10 h-28 w-28 rounded-full bg-brand-violet/20 blur-3xl animate-float float-delay-320" />
        <h1 className="animate-rise-in text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="animate-rise-in max-w-2xl text-ink-soft">{subtitle}</p>}
      </div>
    </div>
  );
}
