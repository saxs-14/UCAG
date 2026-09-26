#!/usr/bin/env -S npx tsx
/**
 * Seeds config/upProgrammes.seed.ts's UP faculties, schools, programmes,
 * and applicationWindows into Firestore with full provenance. UP's APS
 * rule already exists in scripts/seed-real-aps-rules.mts -- run that
 * separately (it's not repeated here).
 *
 * Usage (against local emulator):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-up-data.mts
 *
 * Usage (against real project):
 *   FIREBASE_ADMIN_PROJECT_ID=... FIREBASE_ADMIN_CLIENT_EMAIL=... FIREBASE_ADMIN_PRIVATE_KEY=... npx tsx scripts/seed-up-data.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  UP_FACULTIES,
  UP_SCHOOLS,
  UP_PROGRAMMES,
  UP_APPLICATION_WINDOWS,
} from "../config/upProgrammes.seed";

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
  console.log("Seeding UP Faculties...");
  for (const faculty of UP_FACULTIES) {
    await db.collection("faculties").doc(faculty.id).set(faculty);
    console.log(`  Faculty: ${faculty.id} -> ${faculty.name}`);
  }

  console.log("Seeding UP Schools...");
  for (const school of UP_SCHOOLS) {
    await db.collection("schools").doc(school.id).set(school);
    console.log(`  School: ${school.id} -> ${school.name}`);
  }

  console.log("Seeding UP Programmes...");
  for (const prog of UP_PROGRAMMES) {
    await db.collection("programmes").doc(prog.id).set(prog);
    console.log(`  Programme: ${prog.id} -> ${prog.name}`);
  }

  console.log("Seeding UP Application Windows...");
  for (const win of UP_APPLICATION_WINDOWS) {
    await db.collection("applicationWindows").doc(win.id).set(win);
    console.log(`  Window: ${win.id} (${win.opensOn} to ${win.closesOn})`);
  }

  console.log(
    `Successfully seeded UP dataset (${UP_FACULTIES.length} faculties, ${UP_SCHOOLS.length} schools, ${UP_PROGRAMMES.length} programmes, ${UP_APPLICATION_WINDOWS.length} windows) into ${
      useEmulator ? "local emulator" : "Firestore"
    }. Run seed:aps-rules separately for UP's APS rule.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
