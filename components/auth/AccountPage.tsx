"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteUser, signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { deleteUserProfile, getUserProfile, updateProfilePreferences } from "@/lib/auth/profile";
import { profileToExportJson } from "@/lib/auth/export";
import { resolveSubjectLabel } from "@/config/subjects";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import { useAuth } from "./AuthProvider";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SignInForm";
import { SavedApplicationStatus } from "./SavedApplicationStatus";
import { LABELS } from "@/config/labels";
import type { UserProfile } from "@/lib/firestore/types";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { user, loading, authUnavailable, isAdmin } = useAuth();
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [institutionId, setInstitutionId] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!user) return;

    let cancelled = false;
    getUserProfile(user.uid)
      .then(async (fetchedProfile) => {
        if (cancelled) return;
        setProfile(fetchedProfile);
        setInstitutionId(fetchedProfile?.institutionId ?? "");

        try {
          const rawStashed = sessionStorage.getItem("ucag_stashed_marks");
          if (rawStashed) {
            const stashedMarks = JSON.parse(rawStashed);
            if (Array.isArray(stashedMarks) && stashedMarks.length > 0) {
              const { updateSavedMarks } = await import("@/lib/auth/profile");
              await updateSavedMarks(user.uid, stashedMarks);
              sessionStorage.removeItem("ucag_stashed_marks");
              const updated = await getUserProfile(user.uid);
              if (!cancelled) {
                setProfile(updated);
                setInstitutionId(updated?.institutionId ?? "");
                setNotice(LABELS.account.stashedMarksNotice);
              }
            }
          }
        } catch {
          // A failed optional session hand-off must not break the account page.
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));

    return () => { cancelled = true; };
  }, [user, loading, router]);

  async function handleSaveProfile() {
    if (!user || !institutionId) return;
    setSavingProfile(true);
    setError(null);
    setNotice(null);
    try {
      await updateProfilePreferences(user.uid, { institutionId });
      setProfile((current) => current ? { ...current, institutionId } : current);
      setEditing(false);
      setNotice(LABELS.account.profileSaved);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDeleteAccount() {
    if (!user) return;
    setError(null);
    try {
      await deleteUserProfile(user.uid);
      await deleteUser(user);
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("requires-recent-login")
          ? LABELS.account.recentLoginRequired
          : err instanceof Error ? err.message : String(err)
      );
      setConfirmingDelete(false);
    }
  }

  if (loading) return <p className="p-6 text-sm text-ink-faint">{LABELS.account.checkingAuth}</p>;

  if (authUnavailable) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-2">
        <p className="text-sm text-ink-soft">{LABELS.account.authUnavailable}</p>
        <Link href="/privacy" className="text-sm text-mark-green hover:underline">{LABELS.account.privacyNoticeLink}</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 p-6">
        <p className="text-sm text-ink-faint">{LABELS.account.optionalNote}</p>
        {mode === "signUp" ? <SignUpForm onSwitchToSignIn={() => setMode("signIn")} /> : <SignInForm onSwitchToSignUp={() => setMode("signUp")} />}
        <Link href="/privacy" className="text-sm text-mark-green hover:underline">{LABELS.account.privacyNoticeLink}</Link>
      </div>
    );
  }

  const selectedInstitution = SEED_INSTITUTIONS.find((institution) => institution.id === profile?.institutionId);

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      {notice && <div role="status" className="rounded-2xl border border-mark-green/30 bg-mark-green-soft p-4 text-sm font-semibold text-mark-green">{notice}</div>}
      {error && <p role="alert" className="rounded-2xl border border-mark-red/30 bg-mark-red-soft p-4 text-sm text-mark-red">{error}</p>}

      <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-brand-teal">{LABELS.account.profileHeading}</p>
            <h2 className="mt-1 text-lg font-black text-ink">{user.email ?? user.uid}</h2>
            <p className="mt-1 text-xs leading-5 text-ink-soft">{LABELS.account.profileIntro}</p>
          </div>
          {!editing && <button type="button" onClick={() => setEditing(true)} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-slate-soft">{LABELS.account.editProfileButton}</button>}
        </div>

        <div className="mt-4 rounded-xl border border-line/70 bg-paper p-4">
          <p className="text-xs font-bold text-ink-soft">{LABELS.account.institutionLabel}</p>
          {editing ? (
            <div className="mt-2 flex flex-col gap-3">
              <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} className="min-h-11 rounded-xl border border-line bg-paper-raised px-3 text-sm text-ink focus:border-mark-green focus:outline-none">
                <option value="">{LABELS.account.institutionPlaceholder}</option>
                {SEED_INSTITUTIONS.filter((institution) => institution.tier <= 2).map((institution) => (
                  <option key={institution.id} value={institution.id}>{institution.name} ({institution.shortName})</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2">
                <button type="button" disabled={!institutionId || savingProfile} onClick={handleSaveProfile} className="min-h-11 rounded-xl bg-brand-teal px-4 text-sm font-bold text-white disabled:opacity-50">{savingProfile ? LABELS.account.savingProfileButton : LABELS.account.saveProfileButton}</button>
                <button type="button" onClick={() => { setInstitutionId(profile?.institutionId ?? ""); setEditing(false); }} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft">{LABELS.account.cancelEditButton}</button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold text-ink">{selectedInstitution?.name ?? LABELS.account.institutionMissing}</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wide text-brand-teal">{LABELS.account.savedMarksHeading}</h2>
            <p className="mt-1 text-xs text-ink-soft">{LABELS.account.savedMarksIntro}</p>
          </div>
          <Link href="/#calculator" className="min-h-11 inline-flex items-center rounded-xl border border-line px-3 text-xs font-bold text-ink hover:bg-slate-soft">{LABELS.account.openCalculatorButton}</Link>
        </div>
        {profile?.marks.length ? (
          <ul className="mt-4 divide-y divide-line/60 text-sm">
            {profile.marks.map((m) => <li key={m.subjectCode} className="flex justify-between py-2 text-ink-soft"><span>{resolveSubjectLabel(m.subjectCode)}</span><strong className="text-ink">{m.percentage}%</strong></li>)}
          </ul>
        ) : <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-ink-faint">{LABELS.account.savedMarksEmpty}</p>}
      </section>

      <SavedApplicationStatus profile={profile!} />

      <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-brand-coral">{LABELS.account.shortlistHeading}</h2>
        <p className="mt-1 text-xs text-ink-soft">{LABELS.account.shortlistIntro}</p>
        {profile?.shortlist.length ? (
          <ul className="mt-4 divide-y divide-line/60 text-sm">
            {profile.shortlist.map((id) => <li key={id} className="py-2"><Link href={`/programmes/${id}`} className="font-semibold text-brand-teal hover:underline">{id}</Link></li>)}
          </ul>
        ) : <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-ink-faint">{LABELS.account.shortlistEmpty}</p>}
      </section>

      {isAdmin && (
        <section className="rounded-2xl border border-line bg-paper-raised p-5 shadow-sm">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-brand-navy">{LABELS.account.adminHeading}</h2>
          <Link href="/admin" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm font-semibold text-ink hover:bg-slate-soft">{LABELS.account.adminPortalButton}</Link>
        </section>
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <button type="button" onClick={() => signOut(getFirebaseAuth())} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft">{LABELS.account.signOutButton}</button>
        <button type="button" onClick={() => profile && downloadJson("ucag-my-data.json", profileToExportJson(profile))} disabled={!profile} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft hover:bg-slate-soft disabled:opacity-50">{LABELS.account.downloadDataButton}</button>
        {!confirmingDelete ? (
          <button type="button" onClick={() => setConfirmingDelete(true)} className="min-h-11 rounded-xl border border-mark-red px-4 text-sm font-semibold text-mark-red hover:bg-mark-red-soft">{LABELS.account.deleteAccountButton}</button>
        ) : (
          <div className="w-full rounded-xl border border-mark-red bg-mark-red-soft p-4">
            <p className="text-sm text-ink">{LABELS.account.deleteAccountConfirm}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={handleDeleteAccount} className="min-h-11 rounded-xl bg-mark-red px-4 text-sm font-bold text-white">{LABELS.account.deleteAccountConfirmButton}</button>
              <button type="button" onClick={() => setConfirmingDelete(false)} className="min-h-11 rounded-xl border border-line px-4 text-sm font-semibold text-ink-soft">{LABELS.account.deleteAccountCancelButton}</button>
            </div>
          </div>
        )}
      </div>
      <Link href="/privacy" className="text-sm text-mark-green hover:underline">{LABELS.account.privacyNoticeLink}</Link>
    </div>
  );
}
