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
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <main className="p-6 text-sm text-gray-500">Checking access...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in with an admin account to continue.
        </p>
        <Link href="/account" className="mt-4 inline-block text-mark-green hover:underline">
          Go to sign in
        </Link>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Signed in as <strong>{user.email}</strong>, but this account doesn&apos;t have admin
          access. Grant it with:
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
          npm run admin:grant -- {user.email}
        </pre>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          then sign out and back in on this device.
        </p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b p-3 text-sm dark:border-gray-800 md:w-56 md:flex-col md:border-b-0 md:border-r">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded px-2 py-1.5 ${
              pathname === item.href
                ? "bg-mark-green text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
