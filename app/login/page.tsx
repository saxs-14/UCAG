"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignInForm } from "@/components/auth/SignInForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { user, isAdmin, adminClaimsReady } = useAuth();

  // Redirect if already logged in -- wait for adminClaimsReady so an admin
  // account doesn't get sent to /account first (isAdmin defaults false
  // until the role claim on their fresh ID token has actually resolved,
  // see AuthProvider.tsx). This is the only sign-in page in the app now --
  // there's no separate admin portal to route into first.
  if (user && !user.isAnonymous) {
    if (adminClaimsReady) {
      router.push(isAdmin ? "/admin" : "/account");
    }
    return null;
  }

  return (
    <main id="main-content" className="flex min-h-[80vh] flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 sm:p-8 shadow-md">
        <div className="flex flex-col gap-2 text-center mb-6">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10">
            <Logo size={26} showWordmark={false} />
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-brand-navy">
            Sign In to UCAG
          </h1>
          <p className="text-xs text-ink-soft">
            Access your saved APS results, shortlisted university programmes, and application checklist.
          </p>
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
