"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/auth/profile";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import { LABELS } from "@/config/labels";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import type { ConsentRecord } from "@/lib/firestore/types";

type Step = "ageGate" | "guardianConsent" | "details";

const institutions = SEED_INSTITUTIONS.filter((institution) => institution.tier <= 2);

export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const [step, setStep] = useState<Step>("ageGate");
  const [isMinor, setIsMinor] = useState<boolean | null>(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [institutionId, setInstitutionId] = useState("");
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
      institutionId,
      isMinor: isMinor ?? false,
      consentRecord,
      guardianConsentAt,
    });
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!institutionId) {
      setError(LABELS.account.institutionRequired);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      await handleCreateAccount(credential.user.uid);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    if (!institutionId) {
      setError(LABELS.account.institutionRequired);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithPopup(
        getFirebaseAuth(),
        new GoogleAuthProvider(),
        browserPopupRedirectResolver
      );
      await handleCreateAccount(credential.user.uid);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "ageGate") {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-bold tracking-tight text-ink">{LABELS.account.signUpHeading}</h2>
        <p className="text-sm text-ink-faint">{LABELS.account.optionalNote}</p>
        <p className="font-medium text-ink">{LABELS.account.ageGateQuestion}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" className="min-h-11 rounded-xl bg-mark-green px-3 text-sm font-medium text-white hover:opacity-90" onClick={() => { setIsMinor(false); setStep("details"); }}>
            {LABELS.account.ageGateYes}
          </button>
          <button type="button" className="min-h-11 rounded-xl border border-line px-3 text-sm font-medium text-ink-soft hover:bg-slate-soft" onClick={() => { setIsMinor(true); setStep("guardianConsent"); }}>
            {LABELS.account.ageGateNo}
          </button>
        </div>
        <button type="button" className="min-h-11 text-left text-sm font-medium text-mark-green hover:underline" onClick={onSwitchToSignIn}>
          {LABELS.account.switchToSignIn}
        </button>
      </div>
    );
  }

  if (step === "guardianConsent") {
    return (
      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (guardianConfirmed && guardianName && guardianEmail) setStep("details"); }}>
        <h2 className="text-lg font-bold tracking-tight text-ink">{LABELS.account.guardianConsentHeading}</h2>
        <p className="text-sm text-ink-soft">{LABELS.account.guardianConsentIntro}</p>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.account.guardianNameLabel}
          <input type="text" required className="min-h-11 rounded-xl border border-line bg-paper-raised px-3 text-ink focus:border-mark-green focus:outline-none" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.account.guardianEmailLabel}
          <input type="email" required className="min-h-11 rounded-xl border border-line bg-paper-raised px-3 text-ink focus:border-mark-green focus:outline-none" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
        </label>
        <label className="flex min-h-11 items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" required checked={guardianConfirmed} onChange={(e) => setGuardianConfirmed(e.target.checked)} className="mt-1 h-4 w-4" />
          <span>{LABELS.account.guardianConsentCheckbox}</span>
        </label>
        <button type="submit" disabled={!guardianConfirmed || !guardianName || !guardianEmail} className="min-h-11 rounded-xl bg-mark-green px-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {LABELS.account.guardianConsentSubmit}
        </button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleEmailSignUp}>
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink">{LABELS.account.detailsHeading}</h2>
        <p className="mt-1 text-sm text-ink-soft">{LABELS.account.detailsIntro}</p>
      </div>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        {LABELS.account.institutionLabel}
        <select required value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} className="min-h-11 rounded-xl border border-line bg-paper-raised px-3 text-ink focus:border-mark-green focus:outline-none">
          <option value="">{LABELS.account.institutionPlaceholder}</option>
          {institutions.map((institution) => (
            <option key={institution.id} value={institution.id}>{institution.name} ({institution.shortName})</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        {LABELS.account.emailLabel}
        <input type="email" required className="min-h-11 rounded-xl border border-line bg-paper-raised px-3 text-ink focus:border-mark-green focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        {LABELS.account.passwordLabel}
        <input type="password" required minLength={6} className="min-h-11 rounded-xl border border-line bg-paper-raised px-3 text-ink focus:border-mark-green focus:outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p role="alert" className="text-sm text-mark-red">{error}</p>}
      <button type="submit" disabled={submitting || !institutionId} className="min-h-11 rounded-xl bg-mark-green px-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
        {LABELS.account.createAccountButton}
      </button>
      <button type="button" disabled={submitting || !institutionId} onClick={handleGoogleSignUp} className="min-h-11 rounded-xl border border-line px-3 text-sm font-medium text-ink-soft hover:bg-slate-soft disabled:opacity-50">
        {LABELS.account.googleButton}
      </button>
      <button type="button" className="min-h-11 text-left text-sm font-medium text-mark-green hover:underline" onClick={onSwitchToSignIn}>
        {LABELS.account.switchToSignIn}
      </button>
    </form>
  );
}
