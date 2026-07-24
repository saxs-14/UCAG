#!/usr/bin/env node
/**
 * Grants `role: "admin"` as a Firebase custom claim to a user by email.
 * Roles are never client-writable (see lib/firebase/admin.ts, firestore.rules)
 * -- this script, run by a trusted operator with either emulator access or
 * real Firebase Admin credentials, is the only way an account becomes an
 * admin. There is no self-service admin invite flow, deliberately.
 *
 * Usage (against the local emulator -- see README "Local development"):
 *   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true node --env-file=.env.local scripts/set-admin-claim.mjs someone@example.com
 *   (or: npm run admin:grant -- someone@example.com)
 *
 * Usage (against a real Firebase project -- once one exists for v2):
 *   node --env-file=.env.local scripts/set-admin-claim.mjs someone@example.com
 *   requires FIREBASE_ADMIN_PROJECT_ID / _CLIENT_EMAIL / _PRIVATE_KEY in .env.local,
 *   same as the Admin SDK env lib/env/server.ts already validates.
 */

import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/set-admin-claim.mjs <email>");
  process.exit(1);
}

const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

if (getApps().length === 0) {
  if (useEmulator) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
    initializeApp({ projectId: "demo-ucag" });
  } else {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY, " +
          "and NEXT_PUBLIC_USE_FIREBASE_EMULATOR is not \"true\" either. " +
          "Set one or the other in .env.local."
      );
      process.exit(1);
    }
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  }
}

const auth = getAuth();

try {
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, role: "admin" });
  console.log(`Granted role="admin" to ${email} (uid: ${user.uid}, ${useEmulator ? "emulator" : "real project"}).`);
  if (!useEmulator) {
    console.log("They must sign out and back in (or wait for their ID token to refresh) for it to take effect.");
  }
} catch (err) {
  console.error(`Failed to grant admin: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
