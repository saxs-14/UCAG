import { BursariesPage } from "@/components/bursaries/BursariesPage";
import { LABELS } from "@/config/labels";
import { MarkedHeading } from "@/components/MarkedHeading";
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
    <main id="main-content" className="ruled-paper flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <div className="animate-rise-in">
        <MarkedHeading as="h1" color="coral" className="text-2xl sm:text-3xl">
          {LABELS.bursaries.pageTitle}
        </MarkedHeading>
      </div>
      <BursariesPage bursaries={bursaries} internships={internships} />
    </main>
  );
}
