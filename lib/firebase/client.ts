/**
 * Firebase client SDK -- safe to import from client components. Do not
 * import lib/env/server or lib/firebase/admin from here or anywhere that
 * reaches the browser.
 *
 * Auth only, deliberately -- see lib/firebase/firestoreClient.ts for why
 * Firestore lives in its own module (Phase 8's <200KB calculator-route
 * budget). AuthProvider (mounted for every route, including "/") imports
 * this file; if Firestore's SDK -- especially its persistence layer, the
 * single biggest chunk in a Firebase bundle -- lived in the same module,
 * every route would pay for it whether or not that route ever touches
 * Firestore. Splitting this exact way already fixed one bug once before
 * (lib/env/client.ts, Phase 3) -- same lesson, second application.
 *
 * Lazy on purpose: getFirebaseApp()/getFirebaseAuth() only validate and
 * initialize on first call, not at module import time. That matters
 * because no real Firebase project exists for v2 yet (see README.md
 * status) -- eager initialization would crash every page that merely
 * imports this module, even ones that never touch auth.
 *
 * When NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true (see .env.local), connects
 * to the local Firebase emulator suite instead -- this is how Phase 6's
 * account/auth flow is actually live-tested despite there being no real
 * Firebase project: `firebase emulators:start` needs no real credentials
 * at all with a "demo-*" project ID (see .firebaserc).
 */

import { getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import {
  browserLocalPersistence,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  type Auth,
} from "firebase/auth";
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

/**
 * `initializeAuth` instead of the more common `getAuth()` -- deliberately.
 * `getAuth()` auto-attaches `browserPopupRedirectResolver`, which eagerly
 * injects Google's `apis.google.com/js/api.js` iframe-helper script on
 * every single page this runs on, whether or not that page ever shows a
 * sign-in button (a real Lighthouse Best Practices finding on "/" -- the
 * calculator route, which has no auth UI at all). `initializeAuth`
 * without a resolver skips that; `signInWithPopup` calls (SignInForm/
 * SignUpForm) pass `browserPopupRedirectResolver` explicitly instead, so
 * it's only fetched when a learner actually clicks "Continue with Google."
 */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = initializeAuth(getFirebaseApp(), {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  }
  if (isFirebaseEmulatorEnabled() && !authEmulatorConnected) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
}
