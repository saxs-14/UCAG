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

/**
 * The real, live-Firestore replacement for config/sampleData.ts. Every
 * collection here is public-read (firestore.rules) and every document
 * returned has already passed isFactVerified() -- the single gate
 * lib/firestore/types.ts designates for this exact purpose. A programme,
 * institution, or APS rule an admin hasn't yet approved through the
 * verification queue simply isn't in these arrays; nothing here is ever
 * "probably right." components/results/ResultsSection.tsx is responsible
 * for what it shows when a piece it needs (most commonly: a verified
 * apsRule for a given institution) is genuinely missing -- see its own
 * comments for that decision (never compute a qualify/almost/not-yet
 * verdict without a verified formula to compute it with).
 */
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
  const db = getFirebaseDb();
  const [institutions, faculties, schools, programmes, apsRules, applicationWindows] = await Promise.all([
    getDocs(collection(db, "institutions")),
    getDocs(collection(db, "faculties")),
    getDocs(collection(db, "schools")),
    getDocs(collection(db, "programmes")),
    getDocs(collection(db, "apsRules")),
    getDocs(collection(db, "applicationWindows")),
  ]);

  return {
    institutions: docsWithId<Institution>(institutions),
    faculties: docsWithId<Faculty>(faculties),
    schools: docsWithId<School>(schools),
    programmes: docsWithId<Programme>(programmes),
    apsRules: docsWithId<ApsRule>(apsRules),
    applicationWindows: docsWithId<ApplicationWindow>(applicationWindows),
  };
}
