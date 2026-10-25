import { after } from "next/server";
import { InternshipsPage } from "@/components/internships/InternshipsPage";
import { LABELS } from "@/config/labels";
import { PageHero } from "@/components/PageHero";
import { fetchRealBursariesAndInternships } from "@/lib/catalog/getRealBursariesAndInternships";
import { incrementUsageStat } from "@/lib/activity/trackUsage";

export const metadata = {
  title: `${LABELS.internships.pageTitle} -- ${LABELS.app.name}`,
  description: LABELS.internships.pageSubtitle,
  alternates: { canonical: "/internships" },
};

// Same reasoning as app/bursaries/page.tsx: real data, not a build-time
// snapshot, specifically because filterInternships hides listings past
// their closing date -- a frozen page would keep showing an expired
// listing as open forever.
export const dynamic = "force-dynamic";

export default async function Internships() {
  const { internships } = await fetchRealBursariesAndInternships();
  after(() => incrementUsageStat("fundingDiscoveryViews"));
  return (
    <main id="main-content" className="flex flex-1 flex-col items-center bg-paper">
      <PageHero title={LABELS.internships.pageTitle} subtitle={LABELS.internships.pageSubtitle} />
      <div className="flex w-full flex-col items-center gap-6 p-6 sm:p-8">
        <InternshipsPage internships={internships} />
      </div>
    </main>
  );
}
