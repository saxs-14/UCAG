import { LABELS } from "@/config/labels";
import { CalculatorPage } from "@/components/CalculatorPage";

// The landing page IS the calculator -- no marketing hero above it
// (docs/MASTER_PROMPT_v2.md sect. 3). The title/tagline pair below is a
// two-line label, not a hero: no imagery, no scroll depth added.
export default function Home() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <div className="no-print flex flex-col items-center gap-1.5 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {LABELS.app.name}
        </h1>
        <p className="max-w-md text-sm text-ink-soft sm:text-base">{LABELS.app.tagline}</p>
      </div>
      <CalculatorPage />
    </main>
  );
}
