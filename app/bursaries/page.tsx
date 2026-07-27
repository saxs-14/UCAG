import { BursariesPage } from "@/components/bursaries/BursariesPage";
import { LABELS } from "@/config/labels";
import { PageHero } from "@/components/PageHero";
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
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <PageHero title={LABELS.bursaries.pageTitle} subtitle={LABELS.bursaries.pageSubtitle} />
      <div className="flex w-full flex-col items-center gap-6 p-6 sm:p-8">
        <BursariesPage bursaries={bursaries} internships={internships} />
      </div>
    </main>
  );
}
