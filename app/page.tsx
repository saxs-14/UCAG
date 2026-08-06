import { LABELS } from "@/config/labels";
import { CalculatorPage } from "@/components/CalculatorPage";

// app/layout.tsx's RootLayout awaits getCatalogStats() to feed NavBar's
// live trust banner ("N institutions -- N verified programmes -- updated
// <date>") on every route, "/" included. Without this, Next.js would
// prerender "/" once at build time and freeze those counts into the
// static HTML -- the opposite of the banner's whole point, which is
// honest, live proof of the catalogue's current data quality, not a
// build-time snapshot. Same convention as app/bursaries/page.tsx,
// app/statistics/page.tsx, and app/programmes/[id]/page.tsx.
export const dynamic = "force-dynamic";

// The landing page IS the calculator -- no marketing hero above it
// (docs/MASTER_PROMPT_v2.md sect. 3: "a learner arriving from a
// WhatsApp link should see subject dropdowns without scrolling"). That
// stays true in this pass too -- the title/tagline below is a compact
// two-line label, not the full-width PageHero band used on Bursaries/
// Statistics, specifically so it doesn't push the form below the fold.
export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center gap-6 bg-paper p-6 sm:p-8">
      <section className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-brand-teal-soft/65 bg-brand-navy-soft/90 px-6 py-8 text-center shadow-[0_28px_100px_-70px_rgba(17,72,88,0.75)]">
        <div className="pointer-events-none absolute left-4 top-4 h-20 w-20 rounded-full bg-brand-coral/20 blur-3xl animate-float float-delay-0" />
        <div className="pointer-events-none absolute right-6 top-6 h-24 w-24 rounded-full bg-brand-violet/20 blur-3xl animate-float float-delay-260" />
        <div className="pointer-events-none absolute left-1/2 bottom-0 h-28 w-28 -translate-x-1/2 rounded-full bg-brand-teal/20 blur-3xl animate-float float-delay-520" />
        <div className="animate-rise-in flex flex-col items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{LABELS.app.name}</h1>
          <p className="max-w-2xl text-sm leading-7 text-ink-soft sm:text-base">{LABELS.app.tagline}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-navy shadow-sm">
              Quick APS score
            </span>
            <span className="rounded-full bg-brand-teal-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-teal shadow-sm">
              Learner-friendly
            </span>
          </div>
        </div>
      </section>
      <CalculatorPage />
    </main>
  );
}
