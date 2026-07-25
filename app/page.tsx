import { LABELS } from "@/config/labels";
import { CalculatorPage } from "@/components/CalculatorPage";

// The landing page IS the calculator -- no marketing hero above it
// (docs/MASTER_PROMPT_v2.md sect. 3). The title/tagline pair below is
// still a two-line label, not a hero -- no imagery, no added scroll
// depth -- but it now carries real personality (display font, a warm
// gradient, a soft entrance animation) since that costs zero extra
// vertical space, not zero-effort restraint.
export default function Home() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center gap-6 overflow-x-hidden bg-[radial-gradient(circle_at_50%_-10%,var(--color-brand-teal-soft),transparent_55%)] p-6 sm:p-8"
    >
      <div className="no-print animate-rise-in flex flex-col items-center gap-1.5 text-center">
        <h1 className="bg-gradient-to-r from-brand-teal via-mark-green to-brand-coral bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
          {LABELS.app.name}
        </h1>
        <p className="max-w-md text-sm text-ink-soft sm:text-base">{LABELS.app.tagline}</p>
      </div>
      <CalculatorPage />
    </main>
  );
}
