import { LABELS } from "@/config/labels";
import { SubjectForm } from "@/components/subject-form/SubjectForm";

// Phase 2 checkpoint demo: the subject-selection form working end to end
// (dropdowns, live NSC-level display). This is NOT the real landing page
// -- Phase 3 wires this same form into the actual calculator + results
// flow ("the landing page IS the calculator, no marketing hero above
// it"). Do not treat this layout/copy as a design decision; that's
// Phase 8's job.
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold">{LABELS.app.name}</h1>
        <p className="max-w-md text-base text-gray-600 dark:text-gray-400">
          {LABELS.app.tagline}
        </p>
        <p className="text-sm text-gray-400">
          Phase 2 checkpoint: subject form + APS engine. Results/matching
          land in Phase 3.
        </p>
      </div>
      <SubjectForm />
    </main>
  );
}
