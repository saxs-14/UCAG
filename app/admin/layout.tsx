"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/queue", label: "Course Approvals" },
  { href: "/admin/sources", label: "Institution Data" },
  { href: "/admin/runs", label: "Data Syncs" },
  { href: "/admin/editor", label: "Course Editor" },
  { href: "/admin/dead-links", label: "Broken Links" },
  { href: "/admin/activity", label: "Student Activity" },
] as const;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin, adminClaimsReady } = useAuth();
  const pathname = usePathname();

  if (loading || (user && !adminClaimsReady)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-6">
        <div className="animate-pulse text-lg font-medium text-brand-teal">
          Loading your workspace...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-paper to-brand-teal/10 p-6">
        <div className="w-full max-w-md rounded-3xl border-2 border-white bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-teal text-white shadow-lg">
              <span className="text-2xl font-bold">UCAG</span>
            </div>
          </div>
          <h1 className="text-center font-display text-2xl font-extrabold text-ink">Staff Access Required</h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-ink-soft">
            Welcome to the UCAG platform management system. Please sign in with your staff account to continue.
          </p>
          <Link href="/login" className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl bg-brand-teal px-5 font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-teal/30">
            Sign In to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-paper to-brand-teal/10 p-6">
        <div className="w-full max-w-md rounded-3xl border-2 border-white bg-white/80 p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="font-display text-2xl font-extrabold text-ink">Access Restricted</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            You are signed in as <strong className="font-semibold text-brand-teal">{user.email}</strong>, but this account does not have management permissions.
          </p>
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-800">To gain access, request an administrator to run:</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-white p-3 text-xs font-mono text-ink shadow-sm">
              npm run admin:grant -- {user.email}
            </pre>
          </div>
          <p className="mt-4 text-center text-xs text-ink-soft">
            After access is granted, please sign out and sign back in to refresh your permissions.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto border-b border-line bg-white p-4 shadow-sm md:w-64 md:flex-col md:border-b-0 md:border-r md:p-6 md:shadow-none">
        <div className="hidden md:mb-8 md:flex md:items-center md:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal text-white shadow-md">
            <span className="font-bold">UCAG</span>
          </div>
          <span className="font-display text-lg font-bold text-ink">Management</span>
        </div>
        <div className="flex md:flex-col md:gap-1.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 items-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-teal/30 ${
                pathname === item.href
                  ? "bg-brand-teal text-white shadow-md"
                  : "text-ink-soft hover:bg-brand-teal/10 hover:text-brand-teal"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="min-w-0 flex-1 bg-slate-50 p-4 sm:p-6 md:p-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}