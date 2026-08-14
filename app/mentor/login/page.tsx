"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatAuthError } from "@/lib/auth/formatAuthError";

export default function MentorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/account/mentor");
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main id="main-content" className="flex min-h-[80vh] flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-md">
        <div className="flex flex-col gap-2 text-center mb-6">
          <span className="mx-auto rounded-full bg-brand-coral/10 p-3 text-2xl">🤝</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
            Peer Mentor & Advisor Portal
          </h1>
          <p className="text-xs text-ink-soft">
            Dedicated workspace for verified university student mentors and campus academic advisors.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-mark-red-soft p-3 text-xs font-semibold text-mark-red border border-mark-red/30">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Institutional Email Address
            <input
              type="email"
              required
              placeholder="student@ump.ac.za"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Password
            <input
              type="password"
              required
              placeholder="••••••••"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full cursor-pointer rounded-xl bg-brand-coral px-4 py-2.5 text-sm font-bold text-white shadow hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Signing In..." : "Sign In to Mentor Portal"}
          </button>
        </form>

        <div className="mt-6 border-t border-line/60 pt-4 text-center text-xs text-ink-soft">
          Apply to become a mentor? <Link href="/account" className="font-bold text-brand-teal hover:underline font-semibold">Contact Campus Administration</Link>
        </div>
      </div>
    </main>
  );
}
