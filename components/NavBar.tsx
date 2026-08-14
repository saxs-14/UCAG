"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import type { CatalogStats } from "@/lib/catalog/getCatalogStats";

const NAV_ITEMS = [
  { href: "/", label: `🎓 ${LABELS.nav.calculator}` },
  { href: "/institutions", label: "🏛️ Institutions" },
  { href: "/bursaries", label: `💰 ${LABELS.nav.bursaries}` },
  { href: "/statistics", label: `📊 ${LABELS.nav.statistics}` },
  { href: "/account", label: `👤 ${LABELS.nav.profile}` },
];

interface NavBarProps {
  stats: CatalogStats | null;
}

export function NavBar({ stats }: NavBarProps) {
  const pathname = usePathname();

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
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
