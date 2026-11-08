"use client";

import { useState } from "react";
import { createUserProfile } from "@/lib/auth/profile";
import { LABELS } from "@/config/labels";
import { SEED_INSTITUTIONS } from "@/config/institutions.seed";
import type { ConsentRecord } from "@/lib/firestore/types";

type Step = "ageGate" | "guardianConsent" | "institution";

const institutions = SEED_INSTITUTIONS.filter((institution) => institution.tier <= 2);

/**
 * Shown when a signed-in user (e.g. one who authenticated via "Sign In ->
 * Continue with Google" rather than the Sign Up form) has no userProfiles
 * document yet. Captures the same real age-gate/guardian-consent/institution
 * answers SignUpForm does -- never fabricates isMinor/consent to paper over
 * the gap, since that would silently bypass the POPIA guardian-consent
 * requirement for exactly the users this form exists to catch.
 */
export function CompleteProfileForm({ uid, onComplete }: { uid: string; onComplete: () => void }) {
  const [step, setStep] = useState<Step>("ageGate");
  const [isMinor, setIsMinor] = useState<boolean | null>(null);
  const [guardianName, setGuardianName] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianConfirmed, setGuardianConfirmed] = useState(false);
  const [institutionId, setInstitutionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function finishSetup(e: React.FormEvent) {
    e.preventDefault();
    if (!institutionId) {
      setError(LABELS.account.institutionMissing);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const consentRecord: ConsentRecord | null = isMinor
        ? { consentedAt: new Date().toISOString(), consentedBy: "guardian", guardianName, guardianEmail }
        : null;
      await createUserProfile({
        uid,
        institutionId,
        isMinor: isMinor ?? false,
        consentRecord,
        guardianConsentAt: consentRecord?.consentedAt ?? null,
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="glass-blur rounded-3xl border border-glass-border bg-glass-surface p-6 shadow-sm sm:p-8">
      <div className="mb-2 inline-flex items-center rounded-full bg-brand-amber/10 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-amber">
        Finish setting up your profile
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        You&apos;re signed in, but a couple of details are missing before UCAG can save your marks and shortlist. This takes a few seconds.
      </p>

      {step === "ageGate" && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-base font-bold text-ink">{LABELS.account.ageGateQuestion}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" className="min-h-14 rounded-xl bg-mark-green px-4 text-base font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-mark-green/30" onClick={() => { setIsMinor(false); setStep("institution"); }}>
              {LABELS.account.ageGateYes}
            </button>
            <button type="button" className="min-h-14 rounded-xl border-2 border-line bg-paper-raised px-4 text-base font-bold text-ink-soft transition-colors hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" onClick={() => { setIsMinor(true); setStep("guardianConsent"); }}>
              {LABELS.account.ageGateNo}
            </button>
          </div>
        </div>
      )}

      {step === "guardianConsent" && (
        <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (guardianConfirmed && guardianName && guardianEmail) setStep("institution"); }}>
          <h3 className="font-display text-lg font-black text-ink">{LABELS.account.guardianConsentHeading}</h3>
          <p className="text-sm font-medium leading-relaxed text-ink-soft">{LABELS.account.guardianConsentIntro}</p>

          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
            {LABELS.account.guardianNameLabel}
            <input type="text" required className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
            {LABELS.account.guardianEmailLabel}
            <input type="email" required className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20" value={guardianEmail} onChange={(e) => setGuardianEmail(e.target.value)} />
          </label>

          <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-xl border border-line/50 bg-paper p-4 transition-colors hover:border-brand-teal/30">
            <input type="checkbox" required checked={guardianConfirmed} onChange={(e) => setGuardianConfirmed(e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-line text-brand-teal focus:ring-brand-teal/30 cursor-pointer accent-brand-teal" />
            <span className="text-sm font-medium leading-relaxed text-ink-soft">{LABELS.account.guardianConsentCheckbox}</span>
          </label>

          <button type="submit" disabled={!guardianConfirmed || !guardianName || !guardianEmail} className="mt-1 min-h-12 rounded-xl bg-mark-green px-4 text-base font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-mark-green/30">
            {LABELS.account.guardianConsentSubmit}
          </button>
        </form>
      )}

      {step === "institution" && (
        <form className="mt-6 flex flex-col gap-4" onSubmit={finishSetup}>
          <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
            {LABELS.account.institutionLabel}
            <select required value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20">
              <option value="">{LABELS.account.institutionPlaceholder}</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>{institution.name} ({institution.shortName})</option>
              ))}
            </select>
          </label>

          {error && <p role="alert" className="rounded-xl bg-mark-red/10 p-3 text-sm font-medium text-mark-red">{error}</p>}

          <button type="submit" disabled={submitting || !institutionId} className="min-h-12 rounded-xl bg-mark-green px-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 focus:outline-none focus:ring-4 focus:ring-mark-green/30">
            {submitting ? "Saving..." : "Finish setup"}
          </button>
        </form>
      )}
    </section>
  );
}
