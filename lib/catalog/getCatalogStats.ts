import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { Bursary, Institution, Programme } from "@/lib/firestore/types";

/**
 * Powers the header trust banner (components/NavBar.tsx): real,
 * currently-verified counts, not a static "coming soon" claim. Cached
 * in-memory for a few minutes, same pattern and same reasoning as
 * lib/chat/getRealChatContext.ts -- this changes on the order of admin
 * approvals, not every page view.
 */

export interface CatalogStats {
  institutionCount: number;
  programmeCount: number;
  bursaryCount: number;
  /** Most recent verifiedOn across every verified institution, programme,
   * and bursary -- null if nothing is verified yet. */
  lastVerifiedOn: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { stats: CatalogStats; fetchedAt: number } | null = null;

export function __resetCatalogStatsCacheForTests(): void {
  cached = null;
}

function latestVerifiedOn(dates: string[]): string | null {
  return dates.length ? dates.reduce((latest, d) => (d > latest ? d : latest)) : null;
}

export function computeCatalogStats(raw: {
  institutions: Institution[];
  programmes: Programme[];
  bursaries: Bursary[];
}): CatalogStats {
  const institutions = raw.institutions.filter(isFactVerified);
  const programmes = raw.programmes.filter(isFactVerified);
  const bursaries = raw.bursaries.filter(isFactVerified);

  return {
    institutionCount: institutions.length,
    programmeCount: programmes.length,
    bursaryCount: bursaries.length,
    lastVerifiedOn: latestVerifiedOn([
      ...institutions.map((i) => i.verifiedOn),
      ...programmes.map((p) => p.verifiedOn),
      ...bursaries.map((b) => b.verifiedOn),
    ]),
  };
}

function withId<T>(snap: FirebaseFirestore.QuerySnapshot): T[] {
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<T, "id">), id: doc.id }) as T);
}

export async function getCatalogStats(): Promise<CatalogStats> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.stats;
  }

  const db = getAdminDb();
  const [institutionsSnap, programmesSnap, bursariesSnap] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("programmes").get(),
    db.collection("bursaries").get(),
  ]);

  const stats = computeCatalogStats({
    institutions: withId<Institution>(institutionsSnap),
    programmes: withId<Programme>(programmesSnap),
    bursaries: withId<Bursary>(bursariesSnap),
  });

  cached = { stats, fetchedAt: Date.now() };
  return stats;
}
