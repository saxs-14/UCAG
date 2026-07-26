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
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{LABELS.bursaries.pageTitle}</h1>
      <BursariesPage bursaries={bursaries} internships={internships} />
    </main>
  );
}
