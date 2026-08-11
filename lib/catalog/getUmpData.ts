import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type {
  ApplicationWindow,
  Faculty,
  Institution,
  Programme,
  School,
} from "@/lib/firestore/types";

/**
 * All verified UMP data, loaded from Firestore through the Admin SDK.
 * Every document returned has passed isFactVerified() -- the single gate
 * lib/firestore/types.ts designates as the trust boundary. Unverified
 * drafts in the queue are simply absent from these arrays.
 *
 * Used by app/ump/ (Hub page) and app/ump/programmes/ (Explorer).
 * Server-only because the Admin SDK must never reach the browser, and
 * because secrets never reach the browser (CLAUDE.md core rule).
 */
export interface UmpData {
  institution: Institution | null;
  faculties: Faculty[];
  schools: School[];
  programmes: Programme[];
  applicationWindows: ApplicationWindow[];
}

export async function fetchUmpData(): Promise<UmpData> {
  const db = getAdminDb();

  const [
    institutionSnap,
    facultiesSnap,
    schoolsSnap,
    programmesSnap,
    windowsSnap,
  ] = await Promise.all([
    db.collection("institutions").doc("ump").get(),
    db.collection("faculties").where("institutionId", "==", "ump").get(),
    db.collection("schools").get(), // filtered below by facultyId membership
    db.collection("programmes").where("institutionId", "==", "ump").get(),
    db
      .collection("applicationWindows")
      .where("institutionId", "==", "ump")
      .get(),
  ]);

  const institution = institutionSnap.exists
    ? (() => {
        const doc = {
          ...(institutionSnap.data() as Omit<Institution, "id">),
          id: institutionSnap.id,
        };
        return isFactVerified(doc) ? doc : null;
      })()
    : null;

  const faculties = facultiesSnap.docs
    .map((doc) => ({
      ...(doc.data() as Omit<Faculty, "id">),
      id: doc.id,
    }))
    .filter(isFactVerified);

  const facultyIds = new Set(faculties.map((f) => f.id));

  const schools = schoolsSnap.docs
    .map((doc) => ({
      ...(doc.data() as Omit<School, "id">),
      id: doc.id,
    }))
    .filter(isFactVerified)
    .filter((s) => facultyIds.has(s.facultyId));

  const programmes = programmesSnap.docs
    .map((doc) => ({
      ...(doc.data() as Omit<Programme, "id">),
      id: doc.id,
    }))
    .filter(isFactVerified);

  const applicationWindows = windowsSnap.docs
    .map((doc) => ({
      ...(doc.data() as Omit<ApplicationWindow, "id">),
      id: doc.id,
    }))
    .filter(isFactVerified);

  return { institution, faculties, schools, programmes, applicationWindows };
}
