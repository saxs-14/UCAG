import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firestoreClient";
import type { ConsentRecord, SubjectMark, UserProfile } from "@/lib/firestore/types";

/**
 * Client-SDK reads/writes to a learner's own userProfiles document.
 * Every write here must satisfy firestore.rules' isValidProfileWrite --
 * see tests/firestore-rules.test.ts for what's actually enforced. This
 * file doesn't re-validate client-side; the rules are the enforcement,
 * this is just the convenience wrapper.
 */

function profileRef(uid: string) {
  return doc(getFirebaseDb(), "userProfiles", uid);
}

export interface NewProfileInput {
  uid: string;
  isMinor: boolean;
  consentRecord: ConsentRecord | null;
  guardianConsentAt: string | null;
}

export async function createUserProfile(input: NewProfileInput): Promise<void> {
  const profile: UserProfile = {
    uid: input.uid,
    marks: [],
    shortlist: [],
    consentRecord: input.consentRecord,
    isMinor: input.isMinor,
    guardianConsentAt: input.guardianConsentAt,
    createdAt: new Date().toISOString(),
  };
  await setDoc(profileRef(input.uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(profileRef(uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function updateSavedMarks(uid: string, marks: SubjectMark[]): Promise<void> {
  await updateDoc(profileRef(uid), { marks });
}

export async function updateShortlist(uid: string, shortlist: string[]): Promise<void> {
  await updateDoc(profileRef(uid), { shortlist });
}

/** POPIA "delete my account" -- removes the Firestore profile. Deleting
 * the Firebase Auth account itself happens separately (see
 * components/auth/AccountPage.tsx), since that's a client SDK call on
 * the current user, not a Firestore operation. */
export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(profileRef(uid));
}
