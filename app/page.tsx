import { LABELS } from "@/config/labels";
import { CalculatorPage } from "@/components/CalculatorPage";

// The landing page IS the calculator -- no marketing hero above it
// (docs/MASTER_PROMPT_v2.md sect. 3). Visual design (spacing, type,
// colour) is explicitly Phase 8's job; this is functional layout only.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <div className="no-print flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold">{LABELS.app.name}</h1>
        <p className="max-w-md text-base text-gray-600 dark:text-gray-400">
          {LABELS.app.tagline}
        </p>
      </div>
      <CalculatorPage />
    </main>
  );
}
