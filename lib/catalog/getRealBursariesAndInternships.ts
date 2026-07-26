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
}
