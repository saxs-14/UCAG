"use client";

import { useState } from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { createUserProfile } from "@/lib/auth/profile";
import { LABELS } from "@/config/labels";
import type { ConsentRecord } from "@/lib/firestore/types";

type Step = "ageGate" | "guardianConsent" | "credentials";

/**
 * The age gate + guardian consent flow is not a UI nicety -- it's the
 * only place a ConsentRecord with consentedBy: "guardian" gets created,
 * and firestore.rules rejects any userProfiles write for a minor that
 * doesn't have one (see tests/firestore-rules.test.ts). A learner cannot
 * get past this step and end up with an unconsented minor profile: the
 * write would fail server-side even if this component had a bug.
 */
export function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const [step, setStep] = useState<Step>("ageGate");
  const [isMinor, setIsMinor] = useState<boolean | null>(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
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
    setSubmitting(true);
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      await handleCreateAccount(credential.user.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      await handleCreateAccount(credential.user.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
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
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded bg-mark-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            onClick={() => {
              setIsMinor(false);
              setStep("credentials");
            }}
          >
            {LABELS.account.ageGateYes}
          </button>
          <button
            type="button"
            className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-soft"
            onClick={() => {
              setIsMinor(true);
              setStep("guardianConsent");
            }}
          >
            {LABELS.account.ageGateNo}
          </button>
        </div>
        <button type="button" className="text-left text-sm font-medium text-mark-green hover:underline" onClick={onSwitchToSignIn}>
          {LABELS.account.switchToSignIn}
        </button>
      </div>
    );
  }

  if (step === "guardianConsent") {
    return (
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (guardianConfirmed && guardianName && guardianEmail) setStep("credentials");
        }}
      >
        <h2 className="text-lg font-bold tracking-tight text-ink">{LABELS.account.guardianConsentHeading}</h2>
        <p className="text-sm text-ink-soft">{LABELS.account.guardianConsentIntro}</p>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.account.guardianNameLabel}
          <input
            type="text"
            required
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink focus:border-mark-green focus:outline-none"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-ink-soft">
          {LABELS.account.guardianEmailLabel}
          <input
            type="email"
            required
            className="rounded border border-line bg-paper-raised px-2 py-1 text-ink focus:border-mark-green focus:outline-none"
            value={guardianEmail}
            onChange={(e) => setGuardianEmail(e.target.value)}
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            required
            checked={guardianConfirmed}
            onChange={(e) => setGuardianConfirmed(e.target.checked)}
          />
          {LABELS.account.guardianConsentCheckbox}
        </label>
        <button
          type="submit"
          disabled={!guardianConfirmed || !guardianName || !guardianEmail}
          className="rounded bg-mark-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {LABELS.account.guardianConsentSubmit}
        </button>
      </form>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleEmailSignUp}>
      <h2 className="text-lg font-bold tracking-tight text-ink">{LABELS.account.signUpHeading}</h2>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        {LABELS.account.emailLabel}
        <input
          type="email"
          required
          className="rounded border border-line bg-paper-raised px-2 py-1 text-ink focus:border-mark-green focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-ink-soft">
        {LABELS.account.passwordLabel}
        <input
          type="password"
          required
          minLength={6}
          className="rounded border border-line bg-paper-raised px-2 py-1 text-ink focus:border-mark-green focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-mark-red">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-mark-green px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {LABELS.account.createAccountButton}
      </button>
      <button
        type="button"
        disabled={submitting}
        onClick={handleGoogleSignUp}
        className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-soft"
      >
        {LABELS.account.googleButton}
      </button>
      <button type="button" className="text-left text-sm font-medium text-mark-green hover:underline" onClick={onSwitchToSignIn}>
        {LABELS.account.switchToSignIn}
      </button>
    </form>
  );
}
