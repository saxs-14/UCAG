import { StatisticsPage } from "@/components/statistics/StatisticsPage";
import { LABELS } from "@/config/labels";
import { fetchRealStatistics } from "@/lib/catalog/getRealStatistics";

export const metadata = {
  title: `${LABELS.statistics.pageTitle} -- ${LABELS.app.name}`,
};

// This is real data, not a static snapshot -- without this, Next.js
// prerenders the page once at build time and every visitor gets whatever
// Firestore looked like at that moment, silently going stale as new
// statistics get verified and published.
export const dynamic = "force-dynamic";

export default async function Statistics() {
  const statistics = await fetchRealStatistics();
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center gap-6 p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{LABELS.statistics.pageTitle}</h1>
      <StatisticsPage statistics={statistics} />
    </main>
  );
}
