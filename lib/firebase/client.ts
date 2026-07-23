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
 *
 * When NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true (see .env.local), connects
 * to the local Firebase emulator suite instead -- this is how Phase 6's
 * account/auth flow is actually live-tested despite there being no real
 * Firebase project: `firebase emulators:start` needs no real credentials
 * at all with a "demo-*" project ID (see .firebaserc).
 */

import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseClientConfig, isFirebaseEmulatorEnabled } from "@/lib/env/client";

const EMULATOR_PROJECT_CONFIG: FirebaseOptions = {
  apiKey: "demo-api-key",
  authDomain: "demo-ucag.firebaseapp.com",
  projectId: "demo-ucag",
  storageBucket: "demo-ucag.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
};

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

  // Emulator mode never calls getFirebaseClientConfig() -- a demo project
  // needs no real API key, and requiring one here would defeat the point
  // (testing the account flow with zero real Firebase credentials).
  const firebaseConfig = isFirebaseEmulatorEnabled()
    ? EMULATOR_PROJECT_CONFIG
    : (() => {
        const config = getFirebaseClientConfig();
        return {
          apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: config.NEXT_PUBLIC_FIREBASE_APP_ID,
        } satisfies FirebaseOptions;
      })();

  app = initializeApp(firebaseConfig);
  return app;
}

let auth: Auth | undefined;
let authEmulatorConnected = false;

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  if (isFirebaseEmulatorEnabled() && !authEmulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
}

let db: Firestore | undefined;
let firestoreEmulatorConnected = false;

export function getFirebaseDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    if (isFirebaseEmulatorEnabled() && !firestoreEmulatorConnected) {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      firestoreEmulatorConnected = true;
    }
  }
  return db;
}
