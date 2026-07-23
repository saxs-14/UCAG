import { LABELS } from "@/config/labels";

// Placeholder landing page for Phase 1 (foundation + data model). The
// brief is explicit that the landing page IS the calculator with no
// marketing hero above it -- that's Phase 3's job. This page exists only
// to prove the app boots cleanly; do not treat its layout as a design
// decision.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">{LABELS.app.name}</h1>
      <p className="max-w-md text-base text-gray-600 dark:text-gray-400">
        {LABELS.app.tagline}
      </p>
      <p className="text-sm text-gray-400">
        Phase 1 (foundation + data model) in progress -- the calculator
        lands here in Phase 3.
      </p>
    </main>
  );
}
