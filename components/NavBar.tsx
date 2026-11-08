"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/programmes", label: LABELS.nav.programmes },
  { href: "/bursaries", label: LABELS.nav.bursaries },
  { href: "/internships", label: LABELS.nav.internships },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  return (
    <header className="glass-blur no-print sticky top-0 z-40 border-b border-glass-border bg-glass-surface-strong text-ink shadow-sm">
      <nav className="mx-auto flex min-h-[80px] w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link href="/" className="flex min-h-12 shrink-0 items-center text-ink" aria-label="UCAG home">
          <Logo size={38} wordmarkClassName="text-xl font-black tracking-tight text-ink" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 md:flex">
          {PUBLIC_NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 rounded-2xl px-4 py-2.5 text-xs font-extrabold transition-all ${
                  active 
                    ? "bg-brand-teal/10 text-brand-teal shadow-2xs" 
                    : "text-ink-soft hover:bg-slate-soft hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          {!loading && (isLoggedIn ? (
            <Link
              href="/account"
              className={`inline-flex min-h-11 items-center rounded-2xl px-5 py-2.5 text-xs font-black transition-all shadow-sm ${
                pathname === "/account" 
                  ? "bg-brand-teal text-white shadow-brand-teal/30" 
                  : "bg-slate-soft text-ink hover:bg-slate-soft"
              }`}
            >
              Profile
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="app-mode-hide-narrow inline-flex min-h-11 items-center rounded-2xl bg-brand-teal px-6 py-2.5 text-xs font-black text-white shadow-md shadow-brand-teal/20 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Sign In
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}