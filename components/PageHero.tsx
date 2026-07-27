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
    <div className="w-full bg-brand-navy-soft">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-6 py-8 sm:px-8 sm:py-10">
        <h1 className="animate-rise-in text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="animate-rise-in max-w-2xl text-ink-soft">{subtitle}</p>}
      </div>
    </div>
  );
}
