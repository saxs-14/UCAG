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
 */

import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getServerEnv } from "@/lib/env/server";

let adminApp: App | undefined;

export function getAdminApp(): App {
  if (adminApp) return adminApp;

  const existing = getApps();
  if (existing.length > 0) {
    adminApp = existing[0]!;
    return adminApp;
  }

  const env = getServerEnv();
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
