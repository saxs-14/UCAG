#!/usr/bin/env -S npx tsx
/**
 * Seeds config/umpProgrammes.seed.ts's UMP faculties, schools, programmes,
 * and applicationWindows into Firestore with full provenance.
 *
 * Usage (against local emulator):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-ump-data.mts
 *
 * Usage (against real project):
 *   FIREBASE_ADMIN_PROJECT_ID=... FIREBASE_ADMIN_CLIENT_EMAIL=... FIREBASE_ADMIN_PRIVATE_KEY=... npx tsx scripts/seed-ump-data.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  UMP_FACULTIES,
  UMP_SCHOOLS,
  UMP_PROGRAMMES,
  UMP_APPLICATION_WINDOWS,
  UMP_APS_RULE,
} from "../config/umpProgrammes.seed";

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

async function main() {
  console.log("Seeding UMP Faculties...");
  for (const faculty of UMP_FACULTIES) {
    await db.collection("faculties").doc(faculty.id).set(faculty);
    console.log(`  Faculty: ${faculty.id} -> ${faculty.name}`);
  }

  console.log("Seeding UMP Schools...");
  for (const school of UMP_SCHOOLS) {
    await db.collection("schools").doc(school.id).set(school);
    console.log(`  School: ${school.id} -> ${school.name}`);
  }

  console.log("Seeding UMP Programmes...");
  for (const prog of UMP_PROGRAMMES) {
    await db.collection("programmes").doc(prog.id).set(prog);
    console.log(`  Programme: ${prog.id} -> ${prog.name}`);
  }

  console.log("Seeding UMP Application Windows...");
  for (const win of UMP_APPLICATION_WINDOWS) {
    await db.collection("applicationWindows").doc(win.id).set(win);
    console.log(`  Window: ${win.id} (${win.opensOn} to ${win.closesOn})`);
  }

  console.log("Seeding UMP APS Rule...");
  await db.collection("apsRules").doc(UMP_APS_RULE.id).set(UMP_APS_RULE);
  console.log(`  APS Rule: ${UMP_APS_RULE.id} (${UMP_APS_RULE.scaleName})`);

  console.log(
    `Successfully seeded UMP dataset (${UMP_FACULTIES.length} faculties, ${UMP_SCHOOLS.length} schools, ${UMP_PROGRAMMES.length} programmes, ${UMP_APPLICATION_WINDOWS.length} windows, 1 APS rule) into ${
      useEmulator ? "local emulator" : "Firestore"
    }.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
