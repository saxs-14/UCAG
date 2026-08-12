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
import {
  UMP_FACULTIES,
  UMP_SCHOOLS,
  UMP_PROGRAMMES,
  UMP_APPLICATION_WINDOWS,
} from "@/config/umpProgrammes.seed";
import { TIER_1_INSTITUTIONS } from "@/config/institutions.seed";

export interface UmpData {
  institution: Institution | null;
  faculties: Faculty[];
  schools: School[];
  programmes: Programme[];
  applicationWindows: ApplicationWindow[];
}

export async function fetchUmpData(): Promise<UmpData> {
  const umpInst = TIER_1_INSTITUTIONS.find((i) => i.id === "ump") ?? null;

  try {
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
      db.collection("schools").get(),
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
      : umpInst;

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

    if (faculties.length > 0 && programmes.length > 0) {
      return { institution: institution ?? umpInst, faculties, schools, programmes, applicationWindows };
    }
  } catch (error) {
    console.warn("fetchUmpData: Firestore query unavailable, using verified seed fallback:", error);
  }

  // Complete verified seed fallback -- guarantees zero dashes and zero empty states
  return {
    institution: umpInst,
    faculties: UMP_FACULTIES,
    schools: UMP_SCHOOLS,
    programmes: UMP_PROGRAMMES,
    applicationWindows: UMP_APPLICATION_WINDOWS,
  };
}
