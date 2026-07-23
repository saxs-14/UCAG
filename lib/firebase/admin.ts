/**
 * Firebase Admin SDK -- server-only (transitively guarded via
 * lib/env/server's "server-only" import). Use this for anything that must
 * bypass client Firestore security rules: the ingestion pipeline, the
 * admin console, and API routes performing privileged writes (e.g. custom
 * claims for roles -- see docs/MASTER_PROMPT_v2.md, roles are never
 * client-writable).
 *
 * Lazy, same reasoning as lib/firebase/client.ts: no real Firebase
 * project exists for v2 yet, so eager initialization would crash on
 * import rather than only when something actually calls a getter.
 *
 * Emulator mode (NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true -- see
 * lib/firebase/client.ts) sets FIRESTORE_EMULATOR_HOST/
 * FIREBASE_AUTH_EMULATOR_HOST, which the Admin SDK auto-detects to
 * connect locally with no real service-account credentials at all.
 */

import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getFirebaseAdminEnv } from "@/lib/env/server";

const EMULATOR_PROJECT_ID = "demo-ucag";

function isEmulatorMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";
}

function configureEmulatorHostsIfNeeded(): void {
  if (!isEmulatorMode()) return;
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
}

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  if (isEmulatorMode()) {
    configureEmulatorHostsIfNeeded();
    // The Admin SDK needs a projectId but no real credentials once the
    // emulator host env vars above are set -- it never calls out to
    // real Google services in this mode.
    adminApp = initializeApp({ projectId: EMULATOR_PROJECT_ID });
    return adminApp;
  }

  const env = getFirebaseAdminEnv();
  adminApp = initializeApp({
    credential: cert({
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
  return adminApp;
}

let adminAuth: Auth | undefined;
export function getAdminAuth(): Auth {
  if (!adminAuth) adminAuth = getAuth(getAdminApp());
  return adminAuth;
}

let adminDb: Firestore | undefined;
export function getAdminDb(): Firestore {
  if (!adminDb) adminDb = getFirestore(getAdminApp());
  return adminDb;
}
