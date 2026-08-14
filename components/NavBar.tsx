"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";
import type { CatalogStats } from "@/lib/catalog/getCatalogStats";

const PUBLIC_NAV_ITEMS = [
  { href: "/", label: `🎓 ${LABELS.nav.calculator}` },
  { href: "/institutions", label: "🏛️ Institutions" },
  { href: "/bursaries", label: `💰 ${LABELS.nav.bursaries}` },
  { href: "/statistics", label: `📊 ${LABELS.nav.statistics}` },
];

interface NavBarProps {
  stats: CatalogStats | null;
}

export function NavBar({ stats }: NavBarProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  return (
    <header className="no-print brand-band border-b border-white/10 shadow-sm sticky top-0 z-40 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center text-white transition-transform hover:scale-[1.02] active:scale-95">
          <Logo size={28} wordmarkClassName="text-lg font-bold tracking-tight text-white" />
        </Link>

        {stats && (
          <span className="hidden text-xs text-emerald-300 font-medium bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 md:inline">
            ✨ {stats.institutionCount} SA Universities · {stats.programmeCount > 0 ? `${stats.programmeCount} Degrees` : ""}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
          {PUBLIC_NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {!loading && (
            isLoggedIn ? (
              <Link
                href="/account"
                aria-current={pathname === "/account" ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  pathname === "/account"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                👤 {LABELS.nav.profile}
              </Link>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="flex min-h-9 items-center rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/15 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex min-h-9 items-center rounded-lg bg-teal-500 px-3.5 py-1 text-xs font-extrabold text-white shadow hover:bg-teal-400 transition active:scale-95"
                >
                  Create Account
                </Link>
              </div>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
