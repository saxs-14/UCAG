import { LABELS } from "@/config/labels";
import { CalculatorPage } from "@/components/CalculatorPage";
import { MarkedHeading } from "@/components/MarkedHeading";

// The landing page IS the calculator -- no marketing hero above it
// (docs/MASTER_PROMPT_v2.md sect. 3). The title/tagline pair below is
// still a two-line label, not a hero -- no imagery, no added scroll
// depth. Personality now comes from the same "marked script" language
// as the rest of the redesign (MarkedHeading's hand-drawn underline,
// the ruled-paper page texture, a Caveat-set tagline read as a margin
// note) instead of the previous pass's gradient-text/radial-wash combo.
export default function Home() {
  return (
    <main id="main-content" className="ruled-paper flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <div className="no-print animate-rise-in flex flex-col items-center gap-1 text-center">
        <MarkedHeading as="h1" color="teal" className="text-3xl sm:text-4xl">
          {LABELS.app.name}
        </MarkedHeading>
        <p className="max-w-md font-hand text-lg text-ink-soft sm:text-xl">{LABELS.app.tagline}</p>
      </div>
      <CalculatorPage />
    </main>
  );
}
