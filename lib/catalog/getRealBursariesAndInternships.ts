import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { Bursary, Internship } from "@/lib/firestore/types";

/**
 * Server-only (fetched once per request in app/bursaries/page.tsx, a
 * Server Component) -- unlike the calculator's real-catalog fetch
 * (lib/catalog/getRealCatalog.ts), this page has no reason to pay any
 * client-side Firestore SDK cost at all: the underlying data doesn't
 * depend on anything the learner types, only the filters applied to it
 * do, and that filtering already happens client-side in
 * components/bursaries/BursariesPage.tsx over data passed in as props.
 * config/sampleData.ts's fictional SAMPLE_BURSARIES/SAMPLE_INTERNSHIPS
 * are gone from that component entirely.
 */
export interface RealBursariesAndInternships {
  bursaries: Bursary[];
  internships: Internship[];
}

export async function fetchRealBursariesAndInternships(): Promise<RealBursariesAndInternships> {
  // Same resilience pattern as lib/catalog/getRealCatalog.ts's client-side
  // fetch: a real, temporary failure (Admin credentials not configured
  // for this environment, a transient Firestore outage) must degrade to
  // an honest empty result, never crash the whole page. There's no
  // fictional fallback dataset to fall back to here the way UMP's real
  // seed data stands in for the calculator (config/sampleData.ts's
  // SAMPLE_BURSARIES/SAMPLE_INTERNSHIPS were deliberately removed, see
  // this file's own header) -- an empty list renders BursariesPage's own
  // legitimate "nothing verified yet" state, which is the honest answer
  // when the real data genuinely can't be reached, not a bug to paper
  // over with invented listings.
  try {
    const db = getAdminDb();
    const [bursariesSnap, internshipsSnap] = await Promise.all([
      db.collection("bursaries").get(),
      db.collection("internships").get(),
    ]);

    const bursaries = bursariesSnap.docs
      .map((doc) => ({ ...(doc.data() as Omit<Bursary, "id">), id: doc.id }))
      .filter(isFactVerified);
    const internships = internshipsSnap.docs
      .map((doc) => ({ ...(doc.data() as Omit<Internship, "id">), id: doc.id }))
      .filter(isFactVerified);

    return { bursaries, internships };
  } catch (err) {
    console.warn(
      "fetchRealBursariesAndInternships: Firestore query failed (Admin credentials not configured for this environment, or a transient outage) -- rendering an empty result instead of crashing the page:",
      err
    );
    return { bursaries: [], internships: [] };
  }
}
