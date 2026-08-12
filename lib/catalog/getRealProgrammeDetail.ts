import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { ApplicationWindow, Faculty, Institution, Programme, School } from "@/lib/firestore/types";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import {
  UMP_FACULTIES,
  UMP_SCHOOLS,
  UMP_PROGRAMMES,
  UMP_APPLICATION_WINDOWS,
} from "@/config/umpProgrammes.seed";

export interface RealProgrammeDetail {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  applicationWindow: ApplicationWindow | null;
}

export async function getRealProgrammeDetail(id: string): Promise<RealProgrammeDetail | null> {
  try {
    const db = getAdminDb();
    const programmeSnap = await db.collection("programmes").doc(id).get();
    if (programmeSnap.exists) {
      const programme = { ...(programmeSnap.data() as Omit<Programme, "id">), id: programmeSnap.id };
      if (isFactVerified(programme)) {
        const [institutionSnap, facultySnap, schoolSnap, windowsSnap] = await Promise.all([
          db.collection("institutions").doc(programme.institutionId).get(),
          db.collection("faculties").doc(programme.facultyId).get(),
          db.collection("schools").doc(programme.schoolId).get(),
          db.collection("applicationWindows").where("institutionId", "==", programme.institutionId).get(),
        ]);

        if (institutionSnap.exists && facultySnap.exists && schoolSnap.exists) {
          const institution = { ...(institutionSnap.data() as Omit<Institution, "id">), id: institutionSnap.id };
          const faculty = { ...(facultySnap.data() as Omit<Faculty, "id">), id: facultySnap.id };
          const school = { ...(schoolSnap.data() as Omit<School, "id">), id: schoolSnap.id };
          if (isFactVerified(institution) && isFactVerified(faculty) && isFactVerified(school)) {
            const windows = windowsSnap.docs
              .map((doc) => ({ ...(doc.data() as Omit<ApplicationWindow, "id">), id: doc.id }))
              .filter(isFactVerified);
            const applicationWindow =
              windows.find((w) => w.programmeId === programme.id) ?? windows.find((w) => w.programmeId === null) ?? null;

            return { programme, institution, faculty, school, applicationWindow };
          }
        }
      }
    }
  } catch (err) {
    console.warn("getRealProgrammeDetail: Firestore lookup failed, checking seed dataset:", err);
  }

  // Verified Seed Dataset Fallback
  const seedProg = UMP_PROGRAMMES.find((p) => p.id === id);
  if (!seedProg) return null;

  const seedInst = SEED_INSTITUTIONS.find((i) => i.id === seedProg.institutionId);
  const seedFac = UMP_FACULTIES.find((f) => f.id === seedProg.facultyId);
  const seedSchool = UMP_SCHOOLS.find((s) => s.id === seedProg.schoolId);

  if (!seedInst || !seedFac || !seedSchool) return null;

  const seedWindow =
    UMP_APPLICATION_WINDOWS.find((w) => w.programmeId === seedProg.id) ??
    UMP_APPLICATION_WINDOWS.find((w) => w.programmeId === null) ??
    null;

  return {
    programme: seedProg,
    institution: seedInst,
    faculty: seedFac,
    school: seedSchool,
    applicationWindow: seedWindow,
  };
}

export async function listVerifiedProgrammeIds(): Promise<{ id: string; verifiedOn: string }[]> {
  try {
    const db = getAdminDb();
    const snap = await db.collection("programmes").get();
    if (snap.docs.length > 0) {
      return snap.docs
        .map((doc) => ({ ...(doc.data() as Omit<Programme, "id">), id: doc.id }))
        .filter(isFactVerified)
        .map((p) => ({ id: p.id, verifiedOn: p.verifiedOn }));
    }
  } catch {
    // fallback below
  }

  return UMP_PROGRAMMES.map((p) => ({ id: p.id, verifiedOn: p.verifiedOn }));
}
