import { LABELS } from "@/config/labels";
import { CalculatorPage } from "@/components/CalculatorPage";

// The landing page IS the calculator -- no marketing hero above it
// (docs/MASTER_PROMPT_v2.md sect. 3: "a learner arriving from a
// WhatsApp link should see subject dropdowns without scrolling"). That
// stays true in this pass too -- the title/tagline below is a compact
// two-line label, not the full-width PageHero band used on Bursaries/
// Statistics, specifically so it doesn't push the form below the fold.
export default function Home() {
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center gap-6 bg-paper p-6 sm:p-8">
      <div className="no-print animate-rise-in flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{LABELS.app.name}</h1>
        <p className="max-w-md text-sm text-ink-soft sm:text-base">{LABELS.app.tagline}</p>
      </div>
      <CalculatorPage />
    </main>
  );
}
