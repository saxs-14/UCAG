import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Logo } from "@/components/Logo";

export const metadata = {
  title: "Reset your password -- UCAG",
  description: "Request a password reset link for your UCAG learner account.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <main id="main-content" className="flex min-h-[80vh] flex-1 flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-line bg-paper-raised p-6 shadow-md sm:p-8">
        <div className="mb-6 flex flex-col gap-2 text-center">
          <Link href="/login" className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10" aria-label="Return to sign in">
            <Logo size={26} showWordmark={false} />
          </Link>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
