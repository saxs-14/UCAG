"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteUser, signOut, updateProfile } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { deleteUserProfile, getUserProfile } from "@/lib/auth/profile";
import { profileToExportJson } from "@/lib/auth/export";
import { resolveSubjectLabel } from "@/config/subjects";
import { useAuth } from "./AuthProvider";
import { SignUpForm } from "./SignUpForm";
import { SignInForm } from "./SignInForm";
import { LearnerApplicationJourney } from "./LearnerApplicationJourney";
import { CompleteProfileForm } from "./CompleteProfileForm";
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
  const { user, loading, authUnavailable, isAdmin, displayName, setDisplayName } = useAuth();
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [fullName, setFullName] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shortlistNames, setShortlistNames] = useState<Record<string, string>>({});

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
        setProfileChecked(true);

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
                setNotice(LABELS.account.stashedMarksNotice);
              }
            }
          }
        } catch {
          // Silent fallback for session hand-off
        }
      })
      .catch((err) => {
        setProfileChecked(true);
        setError(err instanceof Error ? err.message : String(err));
      });

    return () => { cancelled = true; };
  }, [user, loading, router]);

  useEffect(() => {
    if (!profile?.shortlist.length) return;
    let cancelled = false;

    import("@/lib/catalog/getRealCatalog")
      .then(({ fetchRealCatalog }) => fetchRealCatalog())
      .then((catalog) => {
        if (cancelled) return;
        const names: Record<string, string> = {};
        for (const programme of catalog.programmes) names[programme.id] = programme.name;
        setShortlistNames(names);
      })
      .catch(() => {
        // Leave shortlistNames empty -- the list falls back to showing the raw id.
      });

    return () => { cancelled = true; };
  }, [profile?.shortlist]);

  async function handleSaveProfile() {
    if (!user) return;
    setSavingProfile(true);
    setError(null);
    setNotice(null);
    try {
      const trimmedName = fullName.trim();
      if (trimmedName !== (displayName ?? "")) {
        await updateProfile(user, { displayName: trimmedName || null });
        setDisplayName(trimmedName || null);
      }
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

  if (loading) return (
    <div className="flex w-full animate-pulse flex-col items-center p-10">
      <div className="h-6 w-32 rounded bg-slate-soft"></div>
    </div>
  );

  if (authUnavailable) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-paper-raised p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-soft text-2xl">🚧</div>
        <p className="text-sm font-medium text-ink-soft">{LABELS.account.authUnavailable}</p>
        <Link href="/privacy" className="text-xs text-brand-teal hover:underline">{LABELS.account.privacyNoticeLink}</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-6">
        <p className="text-center text-sm font-medium text-ink-soft">{LABELS.account.optionalNote}</p>
        <div className="glass-blur-strong rounded-3xl border border-glass-border bg-glass-surface-strong p-6 shadow-xl shadow-brand-teal/5 sm:p-8">
          {mode === "signUp" ? <SignUpForm onSwitchToSignIn={() => setMode("signIn")} /> : <SignInForm onSwitchToSignUp={() => setMode("signUp")} />}
        </div>
        <div className="flex justify-center gap-4 text-center">
          <Link href="/privacy" className="text-xs font-medium text-brand-teal hover:underline">{LABELS.account.privacyNoticeLink}</Link>
          <Link href="/terms" className="text-xs font-medium text-brand-teal hover:underline">{LABELS.account.termsLink}</Link>
        </div>
      </div>
    );
  }

  // Admin/staff accounts stay admin-only, never a learner account too --
  // no CompleteProfileForm prompt, no institution/marks/shortlist to
  // save. Checked before the learner-profile branches below so an admin
  // is never routed into learner-only flows. See the explicit decision
  // this followed: admin accounts must not accumulate learner data.
  if (isAdmin) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-6">
        <section className="glass-blur rounded-3xl border border-glass-border bg-glass-surface p-6 shadow-sm sm:p-8">
          <div className="inline-flex items-center rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-ink">
            {LABELS.account.adminHeading}
          </div>
          <h2 className="mt-2 font-display text-2xl font-black text-ink">{displayName ?? user.email ?? user.uid}</h2>
          {displayName && <p className="text-sm font-medium text-ink-soft">{user.email}</p>}
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{LABELS.account.adminAccountIntro}</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">{LABELS.account.adminAccountNote}</p>
          <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-teal px-6 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
            {LABELS.account.adminPortalButton}
          </Link>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          <button type="button" onClick={() => signOut(getFirebaseAuth())} className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line px-5 text-sm font-bold text-ink-soft transition-colors hover:bg-slate-soft hover:text-ink">
            {LABELS.account.signOutButton}
          </button>
        </div>
        <Link href="/privacy" className="text-xs font-medium text-brand-teal hover:underline">{LABELS.account.privacyNoticeLink}</Link>
      </div>
    );
  }

  // Signed in (e.g. via "Sign In -> Continue with Google" on a first-ever
  // visit) but no userProfiles document exists yet -- every marks/shortlist/
  // checklist save would otherwise fail. Never auto-create one with guessed
  // isMinor/consent values here; that would silently skip the POPIA
  // guardian-consent step for exactly these users.
  if (profileChecked && !profile) {
    return (
      <div className="flex w-full max-w-xl flex-col gap-6">
        <CompleteProfileForm uid={user.uid} onComplete={() => getUserProfile(user.uid).then(setProfile)} />
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      {notice && <div role="status" className="rounded-2xl border-l-4 border-mark-green bg-mark-green/10 p-4 text-sm font-semibold text-mark-green shadow-sm">{notice}</div>}
      {error && <p role="alert" className="rounded-2xl border-l-4 border-mark-red bg-mark-red/10 p-4 text-sm font-medium text-mark-red shadow-sm">{error}</p>}

      <section className="glass-blur rounded-3xl border border-glass-border bg-glass-surface p-6 shadow-sm transition-all hover:shadow-md sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-teal">
              {LABELS.account.profileHeading}
            </div>
            <h2 className="mt-2 font-display text-2xl font-black text-ink">{displayName ?? user.email ?? user.uid}</h2>
            {displayName && <p className="text-sm font-medium text-ink-soft">{user.email}</p>}
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{LABELS.account.profileIntro}</p>
          </div>
          {!editing && (
            <button type="button" onClick={() => { setFullName(displayName ?? ""); setEditing(true); }} className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line px-5 text-sm font-bold text-ink transition-colors hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
              {LABELS.account.editProfileButton}
            </button>
          )}
        </div>

        {editing && (
          <div className="mt-6 rounded-2xl border border-line/70 bg-paper p-5 shadow-inner">
            <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
              {LABELS.account.fullNameLabel}
              <input type="text" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" />
            </label>
          </div>
        )}

        {editing && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={savingProfile} onClick={handleSaveProfile} className="min-h-12 rounded-xl bg-brand-teal px-6 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none">
              {savingProfile ? LABELS.account.savingProfileButton : LABELS.account.saveProfileButton}
            </button>
            <button type="button" onClick={() => { setFullName(displayName ?? ""); setEditing(false); }} className="min-h-12 rounded-xl border-2 border-line px-6 text-sm font-bold text-ink-soft transition-colors hover:bg-slate-soft hover:text-ink">
              {LABELS.account.cancelEditButton}
            </button>
          </div>
        )}
      </section>

      <section className="glass-blur rounded-3xl border border-glass-border bg-glass-surface p-6 shadow-sm transition-all hover:shadow-md sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-teal">{LABELS.account.savedMarksHeading}</h2>
            <p className="mt-1 text-sm text-ink-soft">{LABELS.account.savedMarksIntro}</p>
          </div>
          <Link href="/#calculator" className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line px-4 text-xs font-bold text-ink transition-colors hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
            {LABELS.account.openCalculatorButton}
          </Link>
        </div>
        {profile?.marks.length ? (
          <ul className="mt-6 flex flex-col gap-2">
            {profile.marks.map((m) => (
              <li key={m.subjectCode} className="flex items-center justify-between rounded-xl bg-paper px-4 py-3 text-sm font-medium text-ink-soft border border-line/50 transition-colors hover:border-brand-teal/30">
                <span>{resolveSubjectLabel(m.subjectCode)}</span>
                <strong className="rounded-lg bg-brand-teal/10 px-3 py-1 text-brand-teal">{m.percentage}%</strong>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-paper p-6 border border-line/50 text-center">
            <span className="text-3xl mb-2">📊</span>
            <p className="text-sm font-medium text-ink-soft">{LABELS.account.savedMarksEmpty}</p>
          </div>
        )}
      </section>

      {profile && <LearnerApplicationJourney profile={profile} />}

      <section className="glass-blur rounded-3xl border border-glass-border bg-glass-surface p-6 shadow-sm transition-all hover:shadow-md sm:p-8">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-coral">{LABELS.account.shortlistHeading}</h2>
        <p className="mt-1 text-sm text-ink-soft">{LABELS.account.shortlistIntro}</p>
        {profile?.shortlist.length ? (
          <ul className="mt-6 flex flex-col gap-2">
            {profile.shortlist.map((id) => (
              <li key={id} className="rounded-xl bg-paper px-4 py-3 text-sm font-medium border border-line/50 transition-colors hover:border-brand-coral/30">
                <Link href={`/programmes/${id}`} className="font-bold text-brand-teal hover:underline">{shortlistNames[id] ?? id}</Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl bg-paper p-6 border border-line/50 text-center">
            <span className="text-3xl mb-2">⭐</span>
            <p className="text-sm font-medium text-ink-soft">{LABELS.account.shortlistEmpty}</p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <button type="button" onClick={() => signOut(getFirebaseAuth())} className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line px-5 text-sm font-bold text-ink-soft transition-colors hover:bg-slate-soft hover:text-ink">
          {LABELS.account.signOutButton}
        </button>
        <button type="button" onClick={() => profile && downloadJson("ucag-my-data.json", profileToExportJson(profile))} disabled={!profile} className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-line px-5 text-sm font-bold text-ink-soft transition-colors hover:bg-slate-soft hover:text-ink disabled:opacity-50">
          {LABELS.account.downloadDataButton}
        </button>
        {!confirmingDelete ? (
          <button type="button" onClick={() => setConfirmingDelete(true)} className="inline-flex min-h-11 items-center justify-center rounded-xl border-2 border-mark-red px-5 text-sm font-bold text-mark-red transition-colors hover:bg-mark-red/10">
            {LABELS.account.deleteAccountButton}
          </button>
        ) : (
          <div className="w-full rounded-2xl border border-mark-red bg-mark-red/10 p-5 shadow-sm">
            <p className="text-sm font-medium text-ink">{LABELS.account.deleteAccountConfirm}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={handleDeleteAccount} className="min-h-11 rounded-xl bg-mark-red px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                {LABELS.account.deleteAccountConfirmButton}
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)} className="min-h-11 rounded-xl border-2 border-line px-5 text-sm font-bold text-ink-soft hover:bg-slate-soft">
                {LABELS.account.deleteAccountCancelButton}
              </button>
            </div>
          </div>
        )}
      </div>
      <Link href="/privacy" className="text-xs font-medium text-brand-teal hover:underline">{LABELS.account.privacyNoticeLink}</Link>
    </div>
  );
}