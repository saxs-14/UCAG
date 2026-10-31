import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type {
  Bursary,
  Institution,
  Internship,
  Programme,
  Faculty,
  School,
  Source,
  IngestionRun,
  LinkHealthCheckRecord,
} from "@/lib/firestore/types";

/**
 * Real counts for the admin Overview page -- deliberately separate from
 * lib/catalog/getCatalogStats.ts, which powers the public NavBar banner
 * and only ever reports verified counts (that's the only number a
 * learner should see). An admin operator needs the total/verified split
 * itself (to see how much of what was just imported is still pending
 * review) plus operational pipeline state, neither of which belongs on
 * a public page.
 */

export interface CollectionCounts {
  total: number;
  verified: number;
}

export interface AdminStats {
  institutions: CollectionCounts;
  faculties: CollectionCounts;
  schools: CollectionCounts;
  programmes: CollectionCounts;
  bursaries: CollectionCounts;
  internships: CollectionCounts;
  /** Most recent verifiedOn across every verified document above, null if nothing is verified yet. */
  lastVerifiedOn: string | null;
  sources: { total: number; enabled: number };
  verificationQueue: { pending: number };
  linkHealth: { total: number; dead: number };
  /** Null if no ingestion run has ever been recorded. */
  latestRun: {
    id: string;
    startedAt: string;
    finishedAt: string | null;
    status: IngestionRun["status"];
    itemsProposed: number;
    itemsAutoPublished: number;
    itemsQueued: number;
    errorCount: number;
  } | null;
}

function withId<T>(snap: FirebaseFirestore.QuerySnapshot): T[] {
  return snap.docs.map((doc) => ({ ...(doc.data() as Omit<T, "id">), id: doc.id }) as T);
}

function countCollection<T extends Partial<{ sourceUrl: string; verifiedOn: string; academicYear: number }>>(
  docs: T[]
): CollectionCounts {
  return { total: docs.length, verified: docs.filter(isFactVerified).length };
}

function latestVerifiedOn(dates: string[]): string | null {
  return dates.length ? dates.reduce((latest, d) => (d > latest ? d : latest)) : null;
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = getAdminDb();

  const [
    institutionsSnap,
    facultiesSnap,
    schoolsSnap,
    programmesSnap,
    bursariesSnap,
    internshipsSnap,
    sourcesSnap,
    pendingQueueCount,
    linkHealthSnap,
    latestRunSnap,
  ] = await Promise.all([
    db.collection("institutions").get(),
    db.collection("faculties").get(),
    db.collection("schools").get(),
    db.collection("programmes").get(),
    db.collection("bursaries").get(),
    db.collection("internships").get(),
    db.collection("sources").get(),
    db.collection("verificationQueue").where("status", "==", "pending").count().get(),
    db.collection("linkHealthChecks").get(),
    db.collection("ingestionRuns").orderBy("startedAt", "desc").limit(1).get(),
  ]);

  const institutions = withId<Institution>(institutionsSnap);
  const faculties = withId<Faculty>(facultiesSnap);
  const schools = withId<School>(schoolsSnap);
  const programmes = withId<Programme>(programmesSnap);
  const bursaries = withId<Bursary>(bursariesSnap);
  const internships = withId<Internship>(internshipsSnap);
  const sources = withId<Source>(sourcesSnap);
  const linkHealth = withId<LinkHealthCheckRecord>(linkHealthSnap);

  const verifiedInstitutions = institutions.filter(isFactVerified);
  const verifiedFaculties = faculties.filter(isFactVerified);
  const verifiedSchools = schools.filter(isFactVerified);
  const verifiedProgrammes = programmes.filter(isFactVerified);
  const verifiedBursaries = bursaries.filter(isFactVerified);
  const verifiedInternships = internships.filter(isFactVerified);

  const latestRunDoc = latestRunSnap.docs[0];
  const latestRun = latestRunDoc
    ? (() => {
        const run = { ...(latestRunDoc.data() as Omit<IngestionRun, "id">), id: latestRunDoc.id };
        return {
          id: run.id,
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          status: run.status,
          itemsProposed: run.itemsProposed,
          itemsAutoPublished: run.itemsAutoPublished,
          itemsQueued: run.itemsQueued,
          errorCount: run.errors?.length ?? 0,
        };
      })()
    : null;

  return {
    institutions: countCollection(institutions),
    faculties: countCollection(faculties),
    schools: countCollection(schools),
    programmes: countCollection(programmes),
    bursaries: countCollection(bursaries),
    internships: countCollection(internships),
    lastVerifiedOn: latestVerifiedOn([
      ...verifiedInstitutions.map((d) => d.verifiedOn),
      ...verifiedFaculties.map((d) => d.verifiedOn),
      ...verifiedSchools.map((d) => d.verifiedOn),
      ...verifiedProgrammes.map((d) => d.verifiedOn),
      ...verifiedBursaries.map((d) => d.verifiedOn),
      ...verifiedInternships.map((d) => d.verifiedOn),
    ]),
    sources: { total: sources.length, enabled: sources.filter((s) => s.enabled).length },
    verificationQueue: { pending: pendingQueueCount.data().count },
    linkHealth: { total: linkHealth.length, dead: linkHealth.filter((l) => !l.alive).length },
    latestRun,
  };
}
