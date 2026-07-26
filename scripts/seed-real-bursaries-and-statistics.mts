#!/usr/bin/env -S npx tsx
/**
 * Real, individually-verified bursary, internship, and statistics data,
 * replacing config/sampleData.ts's fictional SAMPLE_BURSARIES/
 * SAMPLE_INTERNSHIPS/SAMPLE_STATISTICS on the Bursaries and Statistics
 * pages. Every value below was independently fetched from a real page
 * (WebFetch/WebSearch, not memory) before being written here -- see each
 * entry's sourceUrl.
 *
 * fieldsOfStudy is deliberately specific per bursary/internship, not a
 * generic list -- the whole point of the field-of-study filter
 * (components/bursaries/BursariesPage.tsx) is to show a learner only
 * what's actually relevant to the course/career they're asking about,
 * not everything with the field ignored. NSFAS is the one deliberate
 * exception: it genuinely funds any recognised qualification, so it's
 * tagged across every field rather than under-representing its real
 * scope.
 *
 * Internship listings are a harder case than bursary programmes: a
 * bursary is a stable annual programme with a shifting deadline: a
 * specific internship posting (e.g. Eskom's individual YES vacancies)
 * opens and closes within weeks and goes stale fast. One was confirmed
 * live via eskom.co.za's own recruitment site, then found already
 * expired/redirected by the time this was written. Rather than publish
 * a posting that may already be gone, the one internship entry below is
 * the stable underlying YES *programme* (yes4youth.co.za, a real,
 * ongoing national initiative, not a single vacancy) -- honest about a
 * real, current gap, not a workaround pretending it isn't one.
 *
 * Both pages are DESIGNED to show "pending verification" / an empty
 * state for anything not on record here -- that's the correct, honest
 * outcome for everything not covered below, not a bug to paper over.
 *
 * Usage (against the local emulator):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-real-bursaries-and-statistics.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { Bursary, Internship, Statistic } from "../lib/firestore/types";

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
      console.error("Missing Firebase Admin env vars and NEXT_PUBLIC_USE_FIREBASE_EMULATOR is not set.");
      process.exit(1);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const db = getFirestore();
const ACADEMIC_YEAR = 2027;
const VERIFIED_ON = "2026-07-26";

// --- Bursaries -------------------------------------------------------------
// closesOn: null where the real window couldn't be confirmed from a
// primary source within reasonable effort. isPastClosingDate() treats
// null as "not expired" by design (lib/ingestion/bursarySafety.ts), so
// this shows as a real, open-ended listing rather than a guessed date --
// never the reverse (a guessed date standing in for "we don't know").
const BURSARIES: Omit<Bursary, "id">[] = [
  {
    name: "NSFAS Bursary",
    provider: "National Student Financial Aid Scheme (NSFAS)",
    fieldsOfStudy: ["Engineering", "Science", "Commerce", "Humanities", "Health Sciences", "Law", "Education", "ICT"],
    levelRequired: "matricOnly",
    closesOn: null,
    value: "Full tuition, accommodation/living allowance, and learning materials (for households earning under R350,000/year, or R600,000/year for students with a disability)",
    criteria: [
      "South African citizen or permanent resident",
      "Combined household income under R350,000/year (R600,000/year if living with a disability)",
      "Admitted to or applying for a public university or TVET college",
    ],
    applyUrl: "https://www.nsfas.org.za/",
    riskFlags: [],
    sourceUrl: "https://www.nsfas.org.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Sasol Bursary Programme",
    provider: "Sasol",
    fieldsOfStudy: ["Engineering", "Science"],
    levelRequired: "matricOnly",
    closesOn: "2026-05-17",
    value: "Full tuition, living allowance, and psychosocial support",
    criteria: [
      "South African citizen by birth, permanently resident in South Africa",
      "Registering for full-time undergraduate study at a Sasol-approved public university (excluding UNISA)",
      "Mathematics and Physical Science at NSC level 6 (70-79%) for engineering degrees",
      "Covers Chemical/Civil/Electrical/Electronic/Industrial/Mechanical/Mining/Metallurgical Engineering, Chemistry, Geology, Data Science, and Mine Surveying",
    ],
    applyUrl: "https://www.sasolbursaries.com",
    riskFlags: [],
    sourceUrl:
      "https://www.sasol.com/media-centre/media-releases/sasol-bursaries-now-open-applications-invited-for-2027-engineering-and-science-studies",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Funza Lushaka Bursary",
    provider: "Department of Basic Education (DBE)",
    fieldsOfStudy: ["Education"],
    levelRequired: "matricOnly",
    closesOn: null, // 2026-cycle dates confirmed (30 Nov / 24 Jan); 2027-cycle dates not yet posted on the official page.
    value: "Full tuition, accommodation or transport, daily meals, learning materials, and a personal care allowance",
    criteria: [
      "South African citizen, passionate about teaching",
      "Accepted into (or applying for) a Bachelor of Education (B.Ed) or Postgraduate Certificate in Education at a public university",
      "Willing to specialise in priority subjects (Maths, Science, Technology, Engineering, South African indigenous languages, and more)",
      "Recipients commit to teaching in a public school after graduating",
    ],
    applyUrl: "https://www.funzalushaka.doe.gov.za/",
    riskFlags: [],
    sourceUrl: "https://www.education.gov.za/Programmes/FunzaLushaka.aspx",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Old Mutual Actuarial Bursary",
    provider: "Old Mutual",
    fieldsOfStudy: ["Commerce", "Science"],
    levelRequired: "matricOnly",
    closesOn: "2026-06-30",
    value: "Full tuition, study materials, meals, residence accommodation, return flights home, and guaranteed employment on graduation",
    criteria: [
      "South African citizen",
      "A for Mathematics (not Mathematical Literacy) and Bs for all other matric subjects",
      "For Actuarial Science at NWU, UCT, Stellenbosch, UP, Wits, UFS, UJ, or UKZN",
    ],
    applyUrl: "https://www.oldmutual.co.za/careers/actuarial-bursary/",
    riskFlags: [],
    sourceUrl: "https://www.oldmutual.co.za/careers/actuarial-bursary/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
  {
    name: "Legal Practitioners Fidelity Fund Bursary",
    provider: "Legal Practitioners Fidelity Fund (LPFF)",
    fieldsOfStudy: ["Law"],
    levelRequired: "currentlyEnrolled",
    closesOn: "2026-08-15", // recurring annual date per LPFF's own page ("applications close 15 August annually")
    value: "Tuition fees for LLB, BCom Law, or BA Law at a public South African university",
    criteria: [
      "2nd or 3rd year LLB student (or equivalent) with an academic average above 50%",
      "Public university students only",
      "LLM/further legal study applicants must hold a completed LLB and be employed at a legal practising firm",
    ],
    applyUrl: "https://www.fidfund.co.za/bursaries/",
    riskFlags: [],
    sourceUrl: "https://www.fidfund.co.za/bursaries/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// --- Internships -------------------------------------------------------
const INTERNSHIPS: Omit<Internship, "id">[] = [
  {
    title: "Youth Employment Service (YES) 12-Month Work Experience Programme",
    provider: "Youth Employment Service (YES)",
    fieldsOfStudy: ["Engineering", "Science", "Commerce", "Humanities", "Health Sciences", "Law", "Education", "ICT"],
    minQualification: "Grade 12 (matric) or equivalent",
    matricOnly: true,
    province: null, // nationwide; specific placements vary by host employer
    closesOn: null, // an ongoing national programme, not a single dated vacancy -- see file header
    applyUrl: "https://www.yes4youth.co.za/",
    sourceUrl: "https://www.yes4youth.co.za/",
    verifiedOn: VERIFIED_ON,
    academicYear: ACADEMIC_YEAR,
  },
];

// --- Statistics --------------------------------------------------------
// 2025 NSC results, independently confirmed from TWO separate official
// SAnews.gov.za (South African Government News Agency / GCIS) articles,
// both citing the Department of Basic Education / Minister Siviwe
// Gwarube's 12 January 2026 announcement -- exact figures matched across
// both. datasetKey "nsc-results-by-province" is what
// components/statistics/StatisticsPage.tsx already renders; every other
// chart on that page correctly continues to show "data pending
// verification" (no fabricated data added for them).
const PROVINCE_PASS_RATES: { province: string; passRate: number }[] = [
  { province: "KwaZulu-Natal", passRate: 90.6 },
  { province: "Free State", passRate: 89.33 },
  { province: "Gauteng", passRate: 89.06 },
  { province: "North West", passRate: 88.49 },
  { province: "Western Cape", passRate: 88.2 },
  { province: "Northern Cape", passRate: 87.79 },
  { province: "Mpumalanga", passRate: 86.55 },
  { province: "Limpopo", passRate: 86.15 },
  { province: "Eastern Cape", passRate: 84.17 },
  { province: "South Africa (national)", passRate: 88 },
];

const STAT_SOURCE_URL = "https://www.sanews.gov.za/south-africa/class-2025-sets-new-national-record-historic-88-pass-rate";
const STAT_PUBLISHER = "Department of Basic Education (via SAnews.gov.za / GCIS)";

const STATISTICS: Omit<Statistic, "id">[] = PROVINCE_PASS_RATES.map(({ province, passRate }) => ({
  dataset: "nsc-results-by-province",
  dimension: province,
  metric: "NSC pass rate",
  value: passRate,
  unit: "%",
  sourceUrl: STAT_SOURCE_URL,
  verifiedOn: VERIFIED_ON,
  publisher: STAT_PUBLISHER,
  year: 2025,
}));

let written = 0;

for (const bursary of BURSARIES) {
  const id = bursary.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
  await db.collection("bursaries").doc(id).set({ id, ...bursary });
  console.log(`  bursary: ${id}`);
  written++;
}

for (const internship of INTERNSHIPS) {
  const id = internship.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
  await db.collection("internships").doc(id).set({ id, ...internship });
  console.log(`  internship: ${id}`);
  written++;
}

for (const stat of STATISTICS) {
  const id = `${stat.dataset}-${stat.dimension}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");
  await db.collection("statistics").doc(id).set({ id, ...stat });
  console.log(`  statistic: ${id} -> ${stat.value}${stat.unit}`);
  written++;
}

console.log(`Seeded ${written} real documents into ${useEmulator ? "the local emulator" : "the real Firestore project"}.`);
