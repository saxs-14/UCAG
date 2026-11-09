"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import { LABELS } from "@/config/labels";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSent(false);
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setSent(true);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="mb-2">
        <h2 className="font-display text-2xl font-black tracking-tight text-ink">{LABELS.account.forgotPasswordHeading}</h2>
        <p className="mt-1 text-sm font-medium text-ink-soft">{LABELS.account.forgotPasswordIntro}</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
        {LABELS.account.emailLabel}
        <input
          type="email"
          required
          autoComplete="email"
          className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      {error && <p role="alert" className="rounded-xl bg-mark-red/10 p-3 text-sm font-medium text-mark-red">{error}</p>}
      {sent && <p role="status" className="rounded-xl bg-mark-green/10 p-3 text-sm font-medium text-mark-green">{LABELS.account.passwordResetNotice}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 rounded-xl bg-mark-green px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-mark-green/30 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {submitting ? LABELS.account.sendingResetLinkButton : LABELS.account.sendResetLinkButton}
      </button>

      <Link href="/login" className="text-center text-sm font-bold text-brand-teal hover:underline">
        {LABELS.account.backToSignIn}
      </Link>
    </form>
  );
}
