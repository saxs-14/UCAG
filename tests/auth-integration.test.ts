/**
 * Integration test against the real Firebase Auth + Firestore emulators
 * (same prerequisite as tests/firestore-rules.test.ts -- emulators must
 * be running). Exercises the exact same SDK calls the UI components
 * (SignUpForm, SignInForm, lib/auth/profile.ts) make -- a real Auth user
 * gets created in the emulator, a real Firestore document gets written
 * and is subject to the real firestore.rules, not a mock of either.
 *
 * This is not a browser test (chrome-devtools MCP was unavailable when
 * this was written -- see the Phase 6 checkpoint), but it verifies the
 * actual backend behavior the UI depends on: Auth account creation,
 * Firestore profile writes succeeding/failing exactly as the rules
 * dictate, sign-in with real credentials, and account deletion. What it
 * does NOT verify is the React form rendering/interaction itself.
 */

import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  terminate,
  type Firestore,
} from "firebase/firestore";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function freshApp() {
  // A unique app name per call avoids "Firebase App already exists"
  // across tests without needing a shared singleton.
  const instance = initializeApp(
    {
      apiKey: "demo-api-key",
      projectId: "demo-ucag",
      authDomain: "demo-ucag.firebaseapp.com",
    },
    `test-${Date.now()}-${Math.random()}`
  );
  const instanceAuth = getAuth(instance);
  const instanceDb = getFirestore(instance);
  connectAuthEmulator(instanceAuth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(instanceDb, "127.0.0.1", 8080);
  return { instance, instanceAuth, instanceDb };
}

beforeEach(() => {
  const fresh = freshApp();
  app = fresh.instance;
  auth = fresh.instanceAuth;
  db = fresh.instanceDb;
});

afterAll(async () => {
  if (db) await terminate(db).catch(() => {});
  if (app) await deleteApp(app).catch(() => {});
});

function randomEmail() {
  return `learner-${Date.now()}-${Math.floor(Math.random() * 100000)}@example.test`;
}

describe("sign-up flow (real Auth + Firestore emulators)", () => {
  it("creates a real Auth user and a matching Firestore profile for an adult learner", async () => {
    const email = randomEmail();
    const credential = await createUserWithEmailAndPassword(auth, email, "correct-horse-battery");
    expect(credential.user.email).toBe(email);

    const profile = {
      uid: credential.user.uid,
      marks: [],
      shortlist: [],
      consentRecord: null,
      isMinor: false,
      guardianConsentAt: null,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "userProfiles", credential.user.uid), profile);

    const snap = await getDoc(doc(db, "userProfiles", credential.user.uid));
    expect(snap.exists()).toBe(true);
    expect(snap.data()?.isMinor).toBe(false);
  });

  it("creates a minor's profile only when a guardian consent record is attached", async () => {
    const email = randomEmail();
    const credential = await createUserWithEmailAndPassword(auth, email, "correct-horse-battery");

    const profileWithoutConsent = {
      uid: credential.user.uid,
      marks: [],
      shortlist: [],
      consentRecord: null,
      isMinor: true,
      guardianConsentAt: null,
      createdAt: new Date().toISOString(),
    };
    await expect(
      setDoc(doc(db, "userProfiles", credential.user.uid), profileWithoutConsent)
    ).rejects.toThrow();

    const profileWithConsent = {
      ...profileWithoutConsent,
      consentRecord: {
        consentedAt: new Date().toISOString(),
        consentedBy: "guardian",
        guardianName: "Jane Doe",
        guardianEmail: "jane@example.test",
      },
      guardianConsentAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "userProfiles", credential.user.uid), profileWithConsent);

    const snap = await getDoc(doc(db, "userProfiles", credential.user.uid));
    expect(snap.exists()).toBe(true);
    expect(snap.data()?.isMinor).toBe(true);
  });

  it("signs in with the real credentials just created", async () => {
    const email = randomEmail();
    await createUserWithEmailAndPassword(auth, email, "correct-horse-battery");
    await signOut(auth);

    const signedIn = await signInWithEmailAndPassword(auth, email, "correct-horse-battery");
    expect(signedIn.user.email).toBe(email);
  });

  it("rejects sign-in with the wrong password", async () => {
    const email = randomEmail();
    await createUserWithEmailAndPassword(auth, email, "correct-horse-battery");
    await signOut(auth);

    await expect(signInWithEmailAndPassword(auth, email, "wrong-password")).rejects.toThrow();
  });

  it("deletes a profile (account-deletion flow) so it no longer exists", async () => {
    const email = randomEmail();
    const credential = await createUserWithEmailAndPassword(auth, email, "correct-horse-battery");
    const ref = doc(db, "userProfiles", credential.user.uid);
    await setDoc(ref, {
      uid: credential.user.uid,
      marks: [],
      shortlist: [],
      consentRecord: null,
      isMinor: false,
      guardianConsentAt: null,
      createdAt: new Date().toISOString(),
    });

    await deleteDoc(ref);
    const snap = await getDoc(ref);
    expect(snap.exists()).toBe(false);
  });

  it("deletes the real Auth account itself (the second half of account deletion)", async () => {
    const email = randomEmail();
    const credential = await createUserWithEmailAndPassword(auth, email, "correct-horse-battery");

    await deleteUser(credential.user);

    // The account is really gone -- signing in with the same credentials
    // now fails, not just "the local session was cleared."
    await expect(signInWithEmailAndPassword(auth, email, "correct-horse-battery")).rejects.toThrow();
  });
});
