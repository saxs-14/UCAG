"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CatalogStats } from "@/lib/catalog/getCatalogStats";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/institutions", label: "Universities" },
  { href: "/programmes", label: LABELS.nav.programmes },
  { href: "/bursaries", label: LABELS.nav.bursaries },
];

interface NavBarProps {
  stats: CatalogStats | null;
}

export function NavBar({ stats }: NavBarProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-brand-navy/95 text-white shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex min-h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6" aria-label="Primary navigation">
        <Link href="/" className="flex min-h-11 shrink-0 items-center text-white" aria-label="UCAG home">
          <Logo size={30} wordmarkClassName="text-lg font-black tracking-tight text-white" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {PUBLIC_NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-10 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${active ? "bg-white/12 text-white" : "text-white/75 hover:bg-white/8 hover:text-white"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {stats && stats.institutionCount > 0 && (
            <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-950/40 px-3 py-1 text-[10px] font-bold text-emerald-200 lg:inline">
              {stats.institutionCount} institutions
            </span>
          )}
          {!loading && (isLoggedIn ? (
            <Link
              href="/account"
              className={`min-h-10 rounded-xl px-3 py-2 text-xs font-bold ${pathname === "/account" ? "bg-brand-teal text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
            >
              Profile
            </Link>
          ) : (
            <>
              <Link href="/login" className="min-h-10 rounded-xl px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white">Sign in</Link>
              <Link href="/register" className="hidden min-h-10 items-center rounded-xl bg-brand-teal px-3.5 py-2 text-xs font-black text-white sm:flex">Create account</Link>
            </>
          ))}
        </div>
      </nav>
    </header>
  );
}
