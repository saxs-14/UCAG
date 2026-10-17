"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CatalogStats } from "@/lib/catalog/getCatalogStats";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/programmes", label: LABELS.nav.programmes },
  { href: "/bursaries", label: LABELS.nav.bursaries },
  { href: "/ump", label: "UMP hub" },
];

interface NavBarProps {
  stats: CatalogStats | null;
}

export function NavBar({ stats }: NavBarProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-paper-raised/95 text-ink shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link href="/" className="flex min-h-11 shrink-0 items-center text-ink" aria-label="UCAG home">
          <Logo size={34} wordmarkClassName="text-lg font-black tracking-tight text-ink" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {PUBLIC_NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-10 rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${active ? "bg-brand-teal-soft text-brand-navy" : "text-ink-soft hover:bg-paper-overlay hover:text-ink"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {stats && stats.institutionCount > 0 && (
            <span className="hidden rounded-full border border-brand-teal/25 bg-brand-teal-soft px-3 py-1 text-[10px] font-bold text-brand-navy lg:inline">
              {stats.institutionCount} institutions
            </span>
          )}
          {!loading && (isLoggedIn ? (
            <Link
              href="/account"
              className={`inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${pathname === "/account" ? "bg-brand-teal text-white" : "text-ink-soft hover:bg-paper-overlay hover:text-ink"}`}
            >
              Profile
            </Link>
          ) : (
            <>
              <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-xs font-bold text-ink-soft transition-colors hover:bg-paper-overlay hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Sign in</Link>
              <Link href="/register" className="hidden min-h-10 items-center rounded-xl bg-brand-teal px-3.5 py-2 text-xs font-black text-white transition-colors hover:bg-brand-navy sm:flex focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Create account</Link>
            </>
          ))}
        </div>
      </nav>
    </header>
  );
}
