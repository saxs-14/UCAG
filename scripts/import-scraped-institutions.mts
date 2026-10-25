#!/usr/bin/env -S npx tsx
/**
 * Imports scraped-but-unverified faculty/school/programme data for UJ,
 * UNISA, and CPUT (scripts/scraping/output/*.json, built by
 * scripts/scraping/scrape.py and its follow-up passes) into Firestore.
 *
 * Deliberately OMITS `verifiedOn` on every document this writes. Per
 * lib/firestore/types.ts's isFactVerified() -- the single gate every
 * public render path must pass through -- a document missing verifiedOn
 * can never render as a public fact, no matter what sourceUrl or
 * academicYear it carries. That's the actual safety mechanism here, not
 * a comment: these documents exist in Firestore (so an admin can review
 * and approve them) but are invisible on every public page until a human
 * sets verifiedOn themselves. This matches Tier 2 ("schema present,
 * partially populated, labelled coming soon") in config/institutions.seed.ts
 * exactly.
 *
 * Does NOT touch the `institutions` collection. uj/unisa/cput's own
 * Institution profiles already exist there, already verified, at Tier 2
 * (config/institutions.seed.ts's TIER_2_INSTITUTIONS) -- this script only
 * adds faculties/schools/programmes, which didn't exist yet for these three.
 *
 * Usage (against local emulator -- always run this first):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/import-scraped-institutions.mts
 *
 * Usage (against the real project):
 *   FIREBASE_ADMIN_PROJECT_ID=... FIREBASE_ADMIN_CLIENT_EMAIL=... FIREBASE_ADMIN_PRIVATE_KEY=... npx tsx scripts/import-scraped-institutions.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CURRENT_ACADEMIC_YEAR } from "../config/academicYear";

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (getApps().length === 0) {
  if (useEmulator) {
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    initializeApp({ projectId: "demo-ucag" });
  } else {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "Missing FIREBASE_ADMIN_* env vars and NEXT_PUBLIC_USE_FIREBASE_EMULATOR is not true."
      );
      process.exit(1);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const db = getFirestore();

interface ScrapedFaculty {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  sourceUrl: string;
}
interface ScrapedSchool {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  sourceUrl: string;
}
interface ScrapedProgramme {
  id: string;
  institutionId: string;
  facultyId: string | null;
  schoolId: string | null;
  name: string;
  qualificationType: string;
  qualificationCode?: string | null;
  nqfLevel?: number | null;
  totalCredits?: number | null;
  saqaId?: string | null;
  duration?: string | null;
  minAps?: number | null;
  additionalRequirements?: string[];
  sourceUrl: string;
}
interface ScrapedInstitutionData {
  institutionId: string;
  faculties: ScrapedFaculty[];
  schools: ScrapedSchool[];
  programmes: ScrapedProgramme[];
  brandColors?: { hex: string; occurrences: number }[];
  brandColorSource?: string | null;
}

// Not scraped per-programme; UNISA is a registered distance university
// (config/institutions.seed.ts's type: "distanceUniversity") so "online"
// is an honest institutional-level default, not a guess -- UJ/CPUT are
// registered contact universities, so "contact" is the same kind of
// institution-level fact rather than an invented per-programme detail.
const MODE_OF_DELIVERY_BY_INSTITUTION: Record<string, "contact" | "online" | "blended"> = {
  unisa: "online",
  uj: "contact",
  cput: "contact",
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const INSTITUTIONS = ["uj", "unisa", "cput"];

async function importOne(id: string) {
  const path = join(__dirname, "scraping", "output", `${id}.json`);
  const data: ScrapedInstitutionData = JSON.parse(readFileSync(path, "utf8"));
  const modeOfDelivery = MODE_OF_DELIVERY_BY_INSTITUTION[id] ?? "contact";

  console.log(`\n${id.toUpperCase()}`);

  let facultyCount = 0;
  for (const f of data.faculties) {
    await db.collection("faculties").doc(f.id).set({
      id: f.id,
      institutionId: f.institutionId,
      name: f.name,
      code: f.code,
      sourceUrl: f.sourceUrl,
      academicYear: CURRENT_ACADEMIC_YEAR,
      // verifiedOn intentionally absent -- see file header.
    });
    facultyCount++;
  }
  console.log(`  faculties: ${facultyCount}`);

  let schoolCount = 0;
  for (const s of data.schools) {
    await db.collection("schools").doc(s.id).set({
      id: s.id,
      facultyId: s.facultyId,
      name: s.name,
      code: s.code,
      sourceUrl: s.sourceUrl,
      academicYear: CURRENT_ACADEMIC_YEAR,
    });
    schoolCount++;
  }
  console.log(`  schools: ${schoolCount}`);

  let programmeCount = 0;
  for (const p of data.programmes) {
    await db.collection("programmes").doc(p.id).set({
      id: p.id,
      institutionId: p.institutionId,
      facultyId: p.facultyId ?? null,
      schoolId: p.schoolId ?? null,
      name: p.name,
      qualificationType: p.qualificationType,
      qualificationCode: p.qualificationCode ?? null,
      nqfLevel: p.nqfLevel ?? null,
      totalCredits: p.totalCredits ?? null,
      saqaId: p.saqaId ?? null,
      duration: p.duration ?? null,
      campuses: [],
      modeOfDelivery,
      minAps: p.minAps ?? null,
      subjectRequirements: [],
      additionalRequirements: p.additionalRequirements ?? [],
      careerOutcomes: [],
      applyUrl: null,
      fieldTags: [],
      sourceUrl: p.sourceUrl,
      academicYear: CURRENT_ACADEMIC_YEAR,
    });
    programmeCount++;
  }
  console.log(`  programmes: ${programmeCount}`);

  if (data.brandColors?.length) {
    console.log(
      `  brandColors: ${data.brandColors.map((c) => c.hex).join(", ")} (source: ${data.brandColorSource})`
    );
  }
}

async function main() {
  console.log("Importing scraped-but-UNVERIFIED institution data.");
  console.log(
    "Every document omits verifiedOn -- isFactVerified() will reject all of them for public rendering until a human reviews and sets it."
  );
  for (const id of INSTITUTIONS) {
    await importOne(id);
  }
  console.log(
    "\nDone. None of this data is publicly visible yet -- see isFactVerified() in lib/firestore/types.ts."
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
