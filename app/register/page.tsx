"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user && !user.isAnonymous) {
    router.push("/account");
    return null;
  }

  return (
    <main id="main-content" className="flex min-h-[80vh] flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-md">
        <div className="flex flex-col gap-2 text-center mb-6">
          <span className="mx-auto rounded-full bg-brand-teal/10 p-3 text-2xl">✨</span>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
            Create Your UCAG Account
          </h1>
          <p className="text-xs text-ink-soft">
            Start your university admissions journey, calculate your APS, and discover matching SA degree programmes.
          </p>
        </div>

        {/* Role choices */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-[11px] font-bold text-center">
          <span className="rounded-xl bg-brand-teal/15 text-brand-teal p-2 border border-brand-teal/30">
            👨‍🎓 Learner
          </span>
          <Link href="/parent/register" className="rounded-xl bg-paper p-2 border border-line text-ink-soft hover:border-brand-teal transition">
            👨‍👩‍👧 Parent
          </Link>
          <Link href="/mentor/register" className="rounded-xl bg-paper p-2 border border-line text-ink-soft hover:border-brand-teal transition">
            🤝 Mentor
          </Link>
        </div>

        <SignUpForm onSwitchToSignIn={() => router.push("/login")} />

        <div className="mt-6 border-t border-line/60 pt-4 text-center text-xs text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand-teal hover:underline font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </main>
  );
}
