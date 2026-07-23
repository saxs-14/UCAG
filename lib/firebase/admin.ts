/**
 * Firebase Admin SDK -- server-only (transitively guarded via
 * lib/env/server's "server-only" import). Use this for anything that must
 * bypass client Firestore security rules: the ingestion pipeline, the
 * admin console, and API routes performing privileged writes (e.g. custom
 * claims for roles -- see docs/MASTER_PROMPT_v2.md, roles are never
 * client-writable).
 */

import "server-only";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { serverEnv } from "@/lib/env/server";

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0]!;

  return initializeApp({
    credential: cert({
      projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: serverEnv.FIREBASE_ADMIN_PRIVATE_KEY,
    }),
  });
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
