/**
 * Firebase client SDK -- safe to import from client components. Do not
 * import lib/env/server or lib/firebase/admin from here or anywhere that
 * reaches the browser.
 *
 * Lazy on purpose: getFirebaseApp()/getFirebaseAuth()/getFirebaseDb() only
 * validate and initialize on first call, not at module import time. That
 * matters because no real Firebase project exists for v2 yet (see
 * README.md status) -- eager initialization would crash every page that
 * merely imports this module, even ones that never touch auth/Firestore.
 */

import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseClientConfig } from "@/lib/env/client";

let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  // Next.js can re-evaluate this module on hot reload -- guard against
  // "Firebase App named '[DEFAULT]' already exists" during dev.
  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0]!;
    return app;
  }

  const config = getFirebaseClientConfig();
  const firebaseConfig: FirebaseOptions = {
    apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: config.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  app = initializeApp(firebaseConfig);
  return app;
}

let auth: Auth | undefined;
export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

let db: Firestore | undefined;
export function getFirebaseDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}
