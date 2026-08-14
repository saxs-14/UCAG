"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatAuthError } from "@/lib/auth/formatAuthError";

export default function ParentRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [learnerEmail, setLearnerEmail] = useState("");
  const [popiaConsent, setPopiaConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!popiaConsent) {
      setError("Parental consent authorization is required under POPIA for minor learner guidance.");
      return;
    }

    setSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/account/parent");
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
          <span className="mx-auto rounded-full bg-brand-teal/10 p-3 text-2xl">👨‍👩‍👧</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
            Create Parent / Guardian Account
          </h1>
          <p className="text-xs text-ink-soft">
            Manage guardian consent, track university deadlines, and support your learner&apos;s application journey under POPIA compliance.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl bg-mark-red-soft p-3 text-xs font-semibold text-mark-red border border-mark-red/30">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Guardian Full Name
            <input
              type="text"
              required
              placeholder="Nomsa Khumalo"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Guardian Email Address
            <input
              type="email"
              required
              placeholder="parent@example.com"
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

          <label className="flex flex-col gap-1 text-xs font-bold text-ink">
            Minor Learner Email Address (Optional)
            <input
              type="email"
              placeholder="learner@example.com"
              className="min-h-11 rounded-xl border border-line bg-paper px-3.5 text-sm font-medium text-ink focus:border-brand-teal focus:outline-none"
              value={learnerEmail}
              onChange={(e) => setLearnerEmail(e.target.value)}
            />
          </label>

          <label className="flex items-start gap-2.5 rounded-xl bg-paper p-3 border border-line text-xs text-ink-soft cursor-pointer">
            <input
              type="checkbox"
              checked={popiaConsent}
              onChange={(e) => setPopiaConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-line text-brand-teal"
            />
            <span>
              I confirm I am the parent/legal guardian and grant POPIA consent for processing minor learner academic guidance records.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full cursor-pointer rounded-xl bg-brand-teal px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? "Creating Guardian Account..." : "Create Parent Account"}
          </button>
        </form>

        <div className="mt-6 border-t border-line/60 pt-4 text-center text-xs text-ink-soft">
          Already registered as a parent?{" "}
          <Link href="/parent/login" className="font-bold text-brand-teal hover:underline font-semibold">
            Sign In to Parent Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
