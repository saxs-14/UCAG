#!/usr/bin/env -S npx tsx
/**
 * Seeds config/sampleData.ts's sample institution, faculty, school, apsRule,
 * programmes, and applicationWindows into Firestore when running against the
 * local emulator or a dev environment. This enables Playwright E2E tests and
 * local interactive testing of the calculator -> results -> apply flow.
 *
 * Usage:
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-sample-data.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  SAMPLE_INSTITUTION,
  SAMPLE_FACULTY,
  SAMPLE_SCHOOL,
  SAMPLE_APS_RULE,
  SAMPLE_PROGRAMMES,
  SAMPLE_APPLICATION_WINDOWS,
} from "../config/sampleData";

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

await db.collection("institutions").doc(SAMPLE_INSTITUTION.id).set(SAMPLE_INSTITUTION);
await db.collection("faculties").doc(SAMPLE_FACULTY.id).set(SAMPLE_FACULTY);
await db.collection("schools").doc(SAMPLE_SCHOOL.id).set(SAMPLE_SCHOOL);
await db.collection("apsRules").doc(SAMPLE_APS_RULE.id).set(SAMPLE_APS_RULE);

for (const programme of SAMPLE_PROGRAMMES) {
  await db.collection("programmes").doc(programme.id).set(programme);
}

for (const window of SAMPLE_APPLICATION_WINDOWS) {
  await db.collection("applicationWindows").doc(window.id).set(window);
}

console.log("Seeded sample institution, faculty, school, apsRule, programmes, and applicationWindows.");
