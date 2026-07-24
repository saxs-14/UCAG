"use client";

import { useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { LABELS } from "@/config/labels";

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
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSignIn}>
      <h2 className="text-lg font-bold tracking-tight text-ink">{LABELS.account.signInHeading}</h2>
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
        {LABELS.account.signInButton}
      </button>
      <button
        type="button"
        disabled={submitting}
        onClick={handleGoogleSignIn}
        className="rounded border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-soft"
      >
        {LABELS.account.googleButton}
      </button>
      <button type="button" className="text-left text-sm font-medium text-mark-green hover:underline" onClick={onSwitchToSignUp}>
        {LABELS.account.switchToSignUp}
      </button>
    </form>
  );
}
