import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import type { Statistic } from "@/lib/firestore/types";

/**
 * Server-only, fetched once per request in app/statistics/page.tsx (a
 * Server Component) and passed down as a prop. The actual "only verified
 * data ever reaches a chart" enforcement stays where it already lived --
 * lib/statistics/select.ts's getVerifiedStatisticsForDataset(), called
 * from components/statistics/StatChart.tsx -- this function just
 * replaces config/sampleData.ts's fictional SAMPLE_STATISTICS as the
 * raw array that gate reads from.
 */
export async function fetchRealStatistics(): Promise<Statistic[]> {
  const db = getAdminDb();
  const snap = await db.collection("statistics").get();
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<Statistic, "id">), id: doc.id }));
}
