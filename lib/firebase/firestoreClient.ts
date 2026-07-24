/**
 * Firestore client SDK, split out of lib/firebase/client.ts on purpose --
 * see that file's header comment. Only import this from code that
 * genuinely touches Firestore (account/profile/shortlist reads and
 * writes, the admin console); importing it pulls in Firestore's
 * persistence layer, the single heaviest piece of the Firebase SDK.
 */

import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";
import { isFirebaseEmulatorEnabled } from "@/lib/env/client";

let db: Firestore | undefined;
let firestoreEmulatorConnected = false;

/**
 * Phase 8 PWA requirement: "the learner's saved results work offline."
 * Firestore's own IndexedDB-backed persistent cache (not a service worker
 * hack -- see public/sw.js's header comment for why) is what actually
 * makes a signed-in learner's saved marks/shortlist readable with no
 * network: once fetched once, they're served from the local cache when
 * offline. `persistentMultipleTabManager` avoids the single-tab lock that
 * `persistentLocalCache`'s default would otherwise impose. Only enabled in
 * the browser -- IndexedDB doesn't exist during any server-side render.
 */
export function getFirebaseDb(): Firestore {
  if (!db) {
    const app = getFirebaseApp();
    db =
      typeof window !== "undefined"
        ? initializeFirestore(app, {
            localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
          })
        : getFirestore(app);
    if (isFirebaseEmulatorEnabled() && !firestoreEmulatorConnected) {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      firestoreEmulatorConnected = true;
    }
  }
  return db;
}
