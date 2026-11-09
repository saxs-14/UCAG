"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/auth/profile";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import { LABELS } from "@/config/labels";
import { useAuth } from "./AuthProvider";
import { PasswordInput } from "./PasswordInput";
import { passwordRequirementError } from "@/lib/auth/passwordStrength";
import type { ConsentRecord } from "@/lib/firestore/types";

type Step = "ageGate" | "guardianConsent" | "details";

export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { setDisplayName } = useAuth();
  const [step, setStep] = useState<Step>("ageGate");
  const [isMinor, setIsMinor] = useState<boolean | null>(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function buildConsentRecord(): { consentRecord: ConsentRecord | null; guardianConsentAt: string | null } {
    if (!isMinor) return { consentRecord: null, guardianConsentAt: null };
    const now = new Date().toISOString();
    return {
      consentRecord: {
        consentedAt: now,
        consentedBy: "guardian",
        guardianName,
        guardianEmail,
      },
      guardianConsentAt: now,
    };
  }

  async function handleCreateAccount(uid: string) {
    const { consentRecord, guardianConsentAt } = buildConsentRecord();
    await createUserProfile({
      uid,
      isMinor: isMinor ?? false,
      consentRecord,
      guardianConsentAt,
    });
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const passwordError = passwordRequirementError(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      const trimmedName = fullName.trim();
      if (trimmedName) {
        await updateProfile(credential.user, { displayName: trimmedName });
      }
      setDisplayName(trimmedName || null);
      await handleCreateAccount(credential.user.uid);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithPopup(
        getFirebaseAuth(),
        new GoogleAuthProvider(),
        browserPopupRedirectResolver
      );
      setDisplayName(credential.user.displayName ?? null);
      await handleCreateAccount(credential.user.uid);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "ageGate") {
    return (
      <div className="flex flex-col gap-4">
        <div className="mb-2">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{LABELS.account.signUpHeading}</h2>
          <p className="mt-1 text-sm font-medium text-ink-soft">{LABELS.account.optionalNote}</p>
        </div>
        
        <div className="rounded-2xl border-2 border-brand-teal/10 bg-brand-teal/5 p-5 text-center">
          <p className="text-base font-bold text-ink">{LABELS.account.ageGateQuestion}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button type="button" className="min-h-14 rounded-xl bg-mark-green px-4 text-base font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-mark-green/30" onClick={() => { setIsMinor(false); setStep("details"); }}>
            {LABELS.account.ageGateYes}
          </button>
          <button type="button" className="min-h-14 rounded-xl border-2 border-line bg-paper-raised px-4 text-base font-bold text-ink-soft transition-colors hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" onClick={() => { setIsMinor(true); setStep("guardianConsent"); }}>
            {LABELS.account.ageGateNo}
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <button type="button" className="text-sm font-bold text-mark-green transition-colors hover:text-green-600 hover:underline" onClick={onSwitchToSignIn}>
            {LABELS.account.switchToSignIn}
          </button>
        </div>
      </div>
    );
  }

  if (step === "guardianConsent") {
    return (
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (guardianConfirmed && guardianName && guardianEmail) setStep("details"); }}>
        <div className="mb-2">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink">{LABELS.account.guardianConsentHeading}</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">{LABELS.account.guardianConsentIntro}</p>
        </div>
        
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
          {LABELS.account.guardianNameLabel}
          <input type="text" required className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
        </label>
        
        <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
          {LABELS.account.guardianEmailLabel}
          <input type="email" required className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
        </label>
        
        <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-xl border border-line/50 bg-paper-raised p-4 transition-colors hover:border-brand-teal/30">
          <input type="checkbox" required checked={guardianConfirmed} onChange={(e) => setGuardianConfirmed(e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-line text-brand-teal focus:ring-brand-teal/30 cursor-pointer accent-brand-teal" />
          <span className="text-sm font-medium leading-relaxed text-ink-soft">{LABELS.account.guardianConsentCheckbox}</span>
        </label>
        
        <button type="submit" disabled={!guardianConfirmed || !guardianName || !guardianEmail} className="mt-2 min-h-12 rounded-xl bg-mark-green px-4 text-base font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none focus:outline-none focus:ring-4 focus:ring-mark-green/30">
          {LABELS.account.guardianConsentSubmit}
        </button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleEmailSignUp}>
      <div className="mb-2 text-center">
        <h2 className="font-display text-2xl font-black tracking-tight text-ink">{LABELS.account.detailsHeading}</h2>
        <p className="mt-1 text-sm font-medium text-ink-soft">{LABELS.account.detailsIntro}</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
        {LABELS.account.fullNameLabel}
        <input type="text" required autoComplete="name" className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </label>
      <p className="-mt-2 text-xs font-medium text-ink-faint px-1">{LABELS.account.fullNameNote}</p>
      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
        {LABELS.account.emailLabel}
        <input type="email" required autoComplete="email" className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
        {LABELS.account.passwordLabel}
        <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
      </label>
      <p className="-mt-2 text-xs font-medium text-ink-faint px-1">{LABELS.account.passwordRequirementsNote}</p>

      {error && <p role="alert" className="rounded-xl bg-mark-red/10 p-3 text-sm font-medium text-mark-red">{error}</p>}

      <p className="-mt-1 text-xs leading-relaxed text-ink-faint">
        {LABELS.account.termsAgreementPrefix}{" "}
        <Link href="/terms" className="font-semibold text-brand-teal hover:underline">{LABELS.account.termsLink}</Link>{" "}
        {LABELS.account.termsAgreementJoiner}{" "}
        <Link href="/privacy" className="font-semibold text-brand-teal hover:underline">{LABELS.account.privacyNoticeLink}</Link>.
      </p>

      <div className="mt-2 flex flex-col gap-3">
        <button type="submit" disabled={submitting} className="min-h-12 rounded-xl bg-mark-green px-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-mark-green/30">
          {submitting ? LABELS.account.creatingAccountButton : LABELS.account.createAccountButton}
        </button>
        
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-line"></div>
          <span className="shrink-0 px-4 text-xs font-bold text-ink-faint uppercase">or</span>
          <div className="flex-grow border-t border-line"></div>
        </div>

        <button type="button" disabled={submitting} onClick={handleGoogleSignUp} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-line bg-paper-raised px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20 disabled:opacity-50">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {submitting ? LABELS.account.continuingWithGoogleButton : LABELS.account.googleButton}
        </button>
      </div>

      <div className="mt-4 text-center">
        <button type="button" className="text-sm font-bold text-mark-green transition-colors hover:text-green-600 hover:underline" onClick={onSwitchToSignIn}>
          {LABELS.account.switchToSignIn}
        </button>
      </div>
    </form>
  );
}