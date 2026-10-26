"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Protected, role-gated (docs/MASTER_PROMPT_v2.md Phase 7). This gate is
 * a UX nicety only -- every actual read/write is independently enforced
 * by firestore.rules' isAdmin() and lib/admin/auth.ts's requireAdmin(),
 * so a determined non-admin poking at this route directly gets nothing
 * more than what's rendered here: an access-denied message.
 */

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/queue", label: "Verification queue" },
  { href: "/admin/sources", label: "Source register" },
  { href: "/admin/runs", label: "Ingestion runs" },
  { href: "/admin/editor", label: "Content editor" },
  { href: "/admin/dead-links", label: "Dead link report" },
  { href: "/admin/activity", label: "Learner activity" },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <main className="p-6 text-sm text-ink-soft">Checking access...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto my-8 max-w-md rounded-2xl border border-line bg-paper-raised p-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Admin access</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Sign in with an admin account to continue.
        </p>
        <Link href="/account" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-teal px-5 font-bold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2">
          Go to sign in
        </Link>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto my-8 max-w-md rounded-2xl border border-line bg-paper-raised p-6">
        <h1 className="font-display text-xl font-extrabold text-ink">Admin</h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Signed in as <strong className="text-ink">{user.email}</strong>, but this account doesn&apos;t have admin
          access. Grant it with:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper p-3 text-xs text-ink">
          npm run admin:grant -- {user.email}
        </pre>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          then sign out and back in on this device.
        </p>
      </main>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-paper md:flex-row">
      <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b border-line bg-paper-raised p-3 text-sm md:w-60 md:flex-col md:border-b-0 md:border-r md:p-4">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`min-h-11 whitespace-nowrap rounded-xl px-3 py-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 ${
              pathname === item.href
                ? "bg-brand-teal text-white shadow-sm"
                : "text-ink-soft hover:bg-brand-teal-soft hover:text-brand-teal"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="min-w-0 flex-1 p-4 sm:p-5 md:p-8">{children}</main>
    </div>
  );
}
