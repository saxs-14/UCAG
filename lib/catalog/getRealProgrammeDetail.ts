import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFactVerified } from "@/lib/firestore/types";
import type { ApplicationWindow, Faculty, Institution, Programme, School } from "@/lib/firestore/types";

export interface RealProgrammeDetail {
  programme: Programme;
  institution: Institution;
  faculty: Faculty;
  school: School;
  applicationWindow: ApplicationWindow | null;
}

/**
 * Server-only, single-programme lookup for app/programmes/[id]/page.tsx --
 * config/sampleData.ts's fictional SAMPLE_PROGRAMMES is gone from that
 * page entirely. Returns null (the page calls notFound()) unless the
 * programme AND its institution/faculty/school all independently pass
 * isFactVerified() -- the same "never render a fact-bearing page from an
 * unverified record" rule as everywhere else real data is read in this
 * app.
 */
export async function getRealProgrammeDetail(id: string): Promise<RealProgrammeDetail | null> {
  const db = getAdminDb();
  const programmeSnap = await db.collection("programmes").doc(id).get();
  if (!programmeSnap.exists) return null;

  const programme = { ...(programmeSnap.data() as Omit<Programme, "id">), id: programmeSnap.id };
  if (!isFactVerified(programme)) return null;

  const [institutionSnap, facultySnap, schoolSnap, windowsSnap] = await Promise.all([
    db.collection("institutions").doc(programme.institutionId).get(),
    db.collection("faculties").doc(programme.facultyId).get(),
    db.collection("schools").doc(programme.schoolId).get(),
    db.collection("applicationWindows").where("institutionId", "==", programme.institutionId).get(),
  ]);

  if (!institutionSnap.exists || !facultySnap.exists || !schoolSnap.exists) return null;

  const institution = { ...(institutionSnap.data() as Omit<Institution, "id">), id: institutionSnap.id };
  const faculty = { ...(facultySnap.data() as Omit<Faculty, "id">), id: facultySnap.id };
  const school = { ...(schoolSnap.data() as Omit<School, "id">), id: schoolSnap.id };
  if (!isFactVerified(institution) || !isFactVerified(faculty) || !isFactVerified(school)) return null;

  const windows = windowsSnap.docs
    .map((doc) => ({ ...(doc.data() as Omit<ApplicationWindow, "id">), id: doc.id }))
    .filter(isFactVerified);
  const applicationWindow =
    windows.find((w) => w.programmeId === programme.id) ?? windows.find((w) => w.programmeId === null) ?? null;

  return { programme, institution, faculty, school, applicationWindow };
}

/** Real programme ids for sitemap.ts -- every verified programme, not
 * just the ones known at build time. */
export async function listVerifiedProgrammeIds(): Promise<{ id: string; verifiedOn: string }[]> {
  const db = getAdminDb();
  const snap = await db.collection("programmes").get();
  return snap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Programme, "id">), id: doc.id }))
    .filter(isFactVerified)
    .map((p) => ({ id: p.id, verifiedOn: p.verifiedOn }));
}
