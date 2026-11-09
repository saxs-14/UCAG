"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import { LABELS } from "@/config/labels";
import { MaskedEmailInput } from "./MaskedEmailInput";

export function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider(), browserPopupRedirectResolver);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
      <div className="mb-2">
        <h2 className="font-display text-2xl font-black tracking-tight text-ink">{LABELS.account.signInHeading}</h2>
        <p className="mt-1 text-sm font-medium text-ink-soft">Welcome back! Pick up right where you left off.</p>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
        {LABELS.account.emailLabel}
        <MaskedEmailInput value={email} onChange={setEmail} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-bold text-ink-soft">
        {LABELS.account.passwordLabel}
        <input
          type="password"
          required
          className="min-h-12 rounded-xl border border-line bg-paper-raised px-4 text-base font-medium text-ink transition-all focus:border-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <div className="-mt-2 text-right">
        <Link href="/forgot-password" className="text-sm font-bold text-brand-teal hover:underline">
          {LABELS.account.forgotPasswordLink}
        </Link>
      </div>

      {error && <p className="rounded-xl bg-mark-red/10 p-3 text-sm font-medium text-mark-red">{error}</p>}
      
      <div className="mt-2 flex flex-col gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 rounded-xl bg-mark-green px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-mark-green/30 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? LABELS.account.signingInButton : LABELS.account.signInButton}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-line"></div>
          <span className="shrink-0 px-4 text-xs font-bold text-ink-faint uppercase">or continue with</span>
          <div className="flex-grow border-t border-line"></div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={handleGoogleSignIn}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-line bg-paper-raised px-4 py-2 text-sm font-bold text-ink transition-colors hover:border-brand-teal hover:bg-brand-teal/5 hover:text-brand-teal focus:outline-none focus:ring-4 focus:ring-brand-teal/20 disabled:opacity-50"
        >
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
        <button type="button" className="text-sm font-bold text-mark-green transition-colors hover:text-green-600 hover:underline" onClick={onSwitchToSignUp}>
          {LABELS.account.switchToSignUp}
        </button>
      </div>
    </form>
  );
}