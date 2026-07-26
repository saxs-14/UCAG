import { BursariesPage } from "@/components/bursaries/BursariesPage";
import { LABELS } from "@/config/labels";
import { fetchRealBursariesAndInternships } from "@/lib/catalog/getRealBursariesAndInternships";

export const metadata = {
  title: `${LABELS.bursaries.pageTitle} -- ${LABELS.app.name}`,
};

// Real data, not a static snapshot -- also correctness-critical here
// specifically because filterBursaries/filterInternships hide listings
// past their closing date (lib/ingestion/bursarySafety.ts); a
// build-time-frozen page would keep showing an expired bursary as open
// forever.
export const dynamic = "force-dynamic";

export default async function Bursaries() {
  const { bursaries, internships } = await fetchRealBursariesAndInternships();
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center gap-6 overflow-x-hidden bg-[radial-gradient(circle_at_50%_-10%,var(--color-brand-coral-soft),transparent_55%)] p-6 sm:p-8"
    >
      <h1 className="animate-rise-in bg-gradient-to-r from-brand-coral via-mark-gold to-brand-teal bg-clip-text font-display text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
        {LABELS.bursaries.pageTitle}
      </h1>
      <BursariesPage bursaries={bursaries} internships={internships} />
    </main>
  );
}
