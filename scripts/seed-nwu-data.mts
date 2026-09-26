#!/usr/bin/env -S npx tsx
/**
 * Seeds config/nwuProgrammes.seed.ts's NWU faculties, schools,
 * programmes, and applicationWindows into Firestore with full
 * provenance. NWU's APS rule already exists in
 * scripts/seed-real-aps-rules.mts -- run that separately.
 *
 * Usage (against local emulator):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-nwu-data.mts
 *
 * Usage (against real project):
 *   FIREBASE_ADMIN_PROJECT_ID=... FIREBASE_ADMIN_CLIENT_EMAIL=... FIREBASE_ADMIN_PRIVATE_KEY=... npx tsx scripts/seed-nwu-data.mts
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  NWU_FACULTIES,
  NWU_SCHOOLS,
  NWU_PROGRAMMES,
  NWU_APPLICATION_WINDOWS,
} from "../config/nwuProgrammes.seed";

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
  console.log("Seeding NWU Faculties...");
  for (const faculty of NWU_FACULTIES) {
    await db.collection("faculties").doc(faculty.id).set(faculty);
    console.log(`  Faculty: ${faculty.id} -> ${faculty.name}`);
  }

  console.log("Seeding NWU Schools...");
  for (const school of NWU_SCHOOLS) {
    await db.collection("schools").doc(school.id).set(school);
    console.log(`  School: ${school.id} -> ${school.name}`);
  }

  console.log("Seeding NWU Programmes...");
  for (const prog of NWU_PROGRAMMES) {
    await db.collection("programmes").doc(prog.id).set(prog);
    console.log(`  Programme: ${prog.id} -> ${prog.name}`);
  }

  console.log("Seeding NWU Application Windows...");
  for (const win of NWU_APPLICATION_WINDOWS) {
    await db.collection("applicationWindows").doc(win.id).set(win);
    console.log(`  Window: ${win.id} (${win.opensOn} to ${win.closesOn})`);
  }

  console.log(
    `Successfully seeded NWU dataset (${NWU_FACULTIES.length} faculties, ${NWU_SCHOOLS.length} schools, ${NWU_PROGRAMMES.length} programmes, ${NWU_APPLICATION_WINDOWS.length} windows) into ${
      useEmulator ? "local emulator" : "Firestore"
    }. Run seed:aps-rules separately for NWU's APS rule.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
