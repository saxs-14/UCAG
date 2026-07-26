#!/usr/bin/env -S npx tsx
/**
 * Loads config/institutions.seed.ts's SEED_INSTITUTIONS (real,
 * previously-verified institution facts -- see that file's header) into
 * the `institutions` Firestore collection. Same gap as sources had before
 * scripts/seed-sources.mts existed: institutions.seed.ts was written and
 * used by the link-health checker directly, but nothing ever wrote it
 * into Firestore, so ResultsSection's real-catalogue queries
 * (lib/catalog/getRealCatalog.ts) would find zero institutions no matter
 * how many programmes got approved through the verification queue.
 *
 * Usage (against the local emulator -- see README "Local development"):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed-institutions.mts
 *
 * Usage (against a real Firebase project, once one exists for v2):
 *   node --env-file=.env.local -- npx tsx scripts/seed-institutions.mts
 *   requires FIREBASE_ADMIN_PROJECT_ID / _CLIENT_EMAIL / _PRIVATE_KEY.
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { SEED_INSTITUTIONS } from "../config/institutions.seed";

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
for (const institution of SEED_INSTITUTIONS) {
  await db.collection("institutions").doc(institution.id).set(institution);
  written++;
  console.log(`  ${institution.id} -> ${institution.name}`);
}

console.log(
  `Seeded ${written} institutions into ${useEmulator ? "the local emulator" : "the real Firestore project"}.`
);
