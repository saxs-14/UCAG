#!/usr/bin/env -S npx tsx
/**
 * Loads config/sources.seed.ts's SEED_SOURCES (real, previously-verified
 * NSFAS/UMP/UCT/Wits/etc URLs -- see that file's header for verification
 * notes) into the `sources` Firestore collection. Nothing writes this data
 * automatically: app/api/admin/sources/route.ts only handles one-at-a-time
 * admin-console adds, and the ingestion pipeline reads from Firestore, not
 * from the static config directly (unlike the link-health checker, which
 * reads SEED_INSTITUTIONS straight from config).
 *
 * Usage (against the local emulator -- see README "Local development"):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-sources.mts
 *
 * Usage (against a real Firebase project, once one exists for v2):
 *   node --env-file=.env.local -- npx tsx scripts/seed-sources.mts
 *   requires FIREBASE_ADMIN_PROJECT_ID / _CLIENT_EMAIL / _PRIVATE_KEY.
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_SOURCES } from "../config/sources.seed";

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
        "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY, " +
          'and NEXT_PUBLIC_USE_FIREBASE_EMULATOR is not "true" either. Set one or the other in .env.local.'
      );
      process.exit(1);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const db = getFirestore();

let written = 0;
for (const source of SEED_SOURCES) {
  await db.collection("sources").doc(source.id).set(source);
  written++;
  console.log(`  ${source.id} -> ${source.url}`);
}

console.log(
  `Seeded ${written} sources into ${useEmulator ? "the local emulator" : "the real Firestore project"}.`
);
