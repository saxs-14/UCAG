"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { useAuth } from "@/components/auth/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"learner" | "parent" | "mentor" | "admin">("learner");

  // Redirect if already logged in
  if (user && !user.isAnonymous) {
    router.push("/account");
    return null;
  }

  return (
    <main id="main-content" className="flex min-h-[80vh] flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-md">
        <div className="flex flex-col gap-2 text-center mb-6">
          <span className="mx-auto rounded-full bg-brand-teal/10 p-3 text-2xl">🎓</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
            Sign In to UCAG
          </h1>
          <p className="text-xs text-ink-soft">
            Access your saved APS results, shortlisted university programmes, and application checklist.
          </p>
        </div>

        {/* Portal selector tabs */}
        <div className="flex rounded-xl bg-paper p-1 border border-line mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("learner")}
            className={`flex-1 py-2 rounded-lg text-center transition ${
              activeTab === "learner"
                ? "bg-brand-teal text-white shadow-xs"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            Learner
          </button>
          <Link
            href="/parent/login"
            className="flex-1 py-2 rounded-lg text-center text-ink-soft hover:text-ink transition"
          >
            Parent
          </Link>
          <Link
            href="/mentor/login"
            className="flex-1 py-2 rounded-lg text-center text-ink-soft hover:text-ink transition"
          >
            Mentor
          </Link>
          <Link
            href="/admin/login"
            className="flex-1 py-2 rounded-lg text-center text-ink-soft hover:text-ink transition"
          >
            Admin
          </Link>
        </div>

        <SignInForm onSwitchToSignUp={() => router.push("/register")} />

        <div className="mt-6 border-t border-line/60 pt-4 text-center text-xs text-ink-soft">
          Don&apos;t have an account yet?{" "}
          <Link href="/register" className="font-bold text-brand-teal hover:underline font-semibold">
            Create Free Learner Account
          </Link>
        </div>
      </div>
    </main>
  );
}
