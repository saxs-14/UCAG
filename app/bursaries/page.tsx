import { after } from "next/server";
import { BursariesPage } from "@/components/bursaries/BursariesPage";
import { LABELS } from "@/config/labels";
import { PageHero } from "@/components/PageHero";
import { fetchRealBursariesAndInternships } from "@/lib/catalog/getRealBursariesAndInternships";
import { incrementUsageStat } from "@/lib/activity/trackUsage";

export const metadata = {
  title: `${LABELS.bursaries.pageTitle} -- ${LABELS.app.name}`,
  description: LABELS.bursaries.pageSubtitle,
  alternates: { canonical: "/bursaries" },
};

// Real data, not a static snapshot -- also correctness-critical here
// specifically because filterBursaries/filterInternships hide listings
// past their closing date (lib/ingestion/bursarySafety.ts); a
// build-time-frozen page would keep showing an expired bursary as open
// forever.
export const dynamic = "force-dynamic";

export default async function Bursaries() {
  const { bursaries } = await fetchRealBursariesAndInternships();
  // next/server's after() -- not a bare un-awaited call -- schedules this
  // once the response has been sent, with the platform's guarantee it
  // runs to completion rather than risking the serverless function
  // freezing mid-write the instant the response flushes. The write's own
  // failure is already swallowed inside incrementUsageStat, so it can
  // never surface here either way.
  after(() => incrementUsageStat("fundingDiscoveryViews"));
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <PageHero title={LABELS.bursaries.pageTitle} subtitle={LABELS.bursaries.pageSubtitle} />
      <div className="flex w-full flex-col items-center gap-6 p-6 sm:p-8">
        <BursariesPage bursaries={bursaries} />
      </div>
    </main>
  );
}
