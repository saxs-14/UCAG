import { collection, getDocs, type QuerySnapshot } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import { isFactVerified } from "@/lib/firestore/types";
import type {
  ApplicationWindow,
  ApsRule,
  Faculty,
  FactProvenance,
  Institution,
  Programme,
  School,
} from "@/lib/firestore/types";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import {
  UMP_FACULTIES,
  UMP_SCHOOLS,
  UMP_PROGRAMMES,
  UMP_APPLICATION_WINDOWS,
} from "@/config/umpProgrammes.seed";
import { SEED_APS_RULES } from "@/config/apsRules.seed";

export interface RealCatalog {
  institutions: Institution[];
  faculties: Faculty[];
  schools: School[];
  programmes: Programme[];
  apsRules: ApsRule[];
  applicationWindows: ApplicationWindow[];
}

function docsWithId<T extends FactProvenance>(snapshot: QuerySnapshot): T[] {
  return snapshot.docs
    .map((doc) => ({ ...(doc.data() as Omit<T, "id">), id: doc.id }) as unknown as T)
    .filter(isFactVerified);
}

export async function fetchRealCatalog(): Promise<RealCatalog> {
  try {
    const db = getFirebaseDb();
    const [institutions, faculties, schools, programmes, apsRules, applicationWindows] = await Promise.all([
      getDocs(collection(db, "institutions")),
      getDocs(collection(db, "faculties")),
      getDocs(collection(db, "schools")),
      getDocs(collection(db, "programmes")),
      getDocs(collection(db, "apsRules")),
      getDocs(collection(db, "applicationWindows")),
    ]);

    const resInstitutions = docsWithId<Institution>(institutions);
    const resFaculties = docsWithId<Faculty>(faculties);
    const resSchools = docsWithId<School>(schools);
    const resProgrammes = docsWithId<Programme>(programmes);
    const resApsRules = docsWithId<ApsRule>(apsRules);
    const resWindows = docsWithId<ApplicationWindow>(applicationWindows);

    if (resProgrammes.length > 0 && resInstitutions.length > 0) {
      return {
        institutions: resInstitutions,
        faculties: resFaculties,
        schools: resSchools,
        programmes: resProgrammes,
        apsRules: resApsRules,
        applicationWindows: resWindows,
      };
    }
  } catch (err) {
    console.warn("fetchRealCatalog: Firestore query failed or unseeded, using seed fallback:", err);
  }

  // Production-ready seed data fallback
  return {
    institutions: SEED_INSTITUTIONS,
    faculties: UMP_FACULTIES,
    schools: UMP_SCHOOLS,
    programmes: UMP_PROGRAMMES,
    apsRules: SEED_APS_RULES,
    applicationWindows: UMP_APPLICATION_WINDOWS,
  };
}
