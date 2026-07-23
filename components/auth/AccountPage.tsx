"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteUser, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { deleteUserProfile, getUserProfile } from "@/lib/auth/profile";
import { profileToExportJson } from "@/lib/auth/export";
import { resolveSubjectLabel } from "@/config/subjects";
import { useAuth } from "./AuthProvider";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SignInForm";
import { LABELS } from "@/config/labels";
import type { UserProfile } from "@/lib/firestore/types";

function downloadJson(filename: string, json: string) {
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AccountPage() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    getUserProfile(user.uid).then(setProfile).catch((err) => setError(String(err)));
  }, [user]);

  async function handleDownloadData() {
    if (!profile) return;
    downloadJson("ucag-my-data.json", profileToExportJson(profile));
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setError(null);
    try {
      await deleteUserProfile(user.uid);
      await deleteUser(user);
    } catch (err) {
      // Firebase requires a recent sign-in for account deletion; surface
      // that plainly rather than a raw SDK error code.
      setError(
        err instanceof Error && err.message.includes("requires-recent-login")
          ? "For your security, please sign out and sign in again before deleting your account."
          : err instanceof Error
            ? err.message
            : String(err)
      );
      setConfirmingDelete(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  if (!user) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <p className="text-sm text-gray-500">{LABELS.account.optionalNote}</p>
        {mode === "signUp" ? (
          <SignUpForm onSwitchToSignIn={() => setMode("signIn")} />
        ) : (
          <SignInForm onSwitchToSignUp={() => setMode("signUp")} />
        )}
        <Link href="/privacy" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          {LABELS.account.privacyNoticeLink}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-sm">
        Signed in as <strong>{user.email ?? user.uid}</strong>
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">{LABELS.account.savedMarksHeading}</h2>
        {profile && profile.marks.length > 0 ? (
          <ul className="text-sm text-gray-600 dark:text-gray-400">
            {profile.marks.map((m) => (
              <li key={m.subjectCode}>
                {resolveSubjectLabel(m.subjectCode)}: {m.percentage}%
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">{LABELS.account.savedMarksEmpty}</p>
        )}
      </section>

      <section className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold">{LABELS.account.shortlistHeading}</h2>
        {profile && profile.shortlist.length > 0 ? (
          <ul className="text-sm text-gray-600 dark:text-gray-400">
            {profile.shortlist.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">{LABELS.account.shortlistEmpty}</p>
        )}
      </section>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <button
          type="button"
          onClick={() => signOut(getFirebaseAuth())}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          {LABELS.account.signOutButton}
        </button>
        <button
          type="button"
          onClick={handleDownloadData}
          disabled={!profile}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-800"
        >
          {LABELS.account.downloadDataButton}
        </button>
        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
          >
            {LABELS.account.deleteAccountButton}
          </button>
        ) : (
          <div className="flex w-full flex-col gap-2 rounded border border-red-300 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
            <p className="text-sm">{LABELS.account.deleteAccountConfirm}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                {LABELS.account.deleteAccountConfirmButton}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                {LABELS.account.deleteAccountCancelButton}
              </button>
            </div>
          </div>
        )}
      </div>

      <Link href="/privacy" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        {LABELS.account.privacyNoticeLink}
      </Link>
    </div>
  );
}
