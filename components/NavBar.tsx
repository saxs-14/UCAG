"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import type { CatalogStats } from "@/lib/catalog/getCatalogStats";

const NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/bursaries", label: LABELS.nav.bursaries },
  { href: "/statistics", label: LABELS.nav.statistics },
  { href: "/account", label: LABELS.nav.profile },
];

interface NavBarProps {
  /** Real, currently-verified record counts (lib/catalog/getCatalogStats.ts),
   * or null when the stats couldn't be fetched -- rendering nothing in
   * that case rather than a stale/fake number. Hidden below the `md`
   * breakpoint: app/layout.tsx already flags that a mobile visitor
   * arriving from a WhatsApp link should see the calculator with no
   * scrolling, so this desktop-only trust signal doesn't add height to
   * that path. */
  stats: CatalogStats | null;
}

/**
 * A real site header: solid institutional band, wordmark on the left,
 * navigation on the right, present on every page -- not just something
 * that appears as page-body text on "/". Previously the app name only
 * ever showed up as a large centered heading on the home page; every
 * other page had no persistent identity at the top at all, which is
 * part of why the site didn't read as "a website" (a CSIR page always
 * shows its header/logo, no matter which section you're on).
 */
export function NavBar({ stats }: NavBarProps) {
  const pathname = usePathname();

  return (
    <header className="no-print brand-band">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center text-white">
          <Logo size={28} wordmarkClassName="text-lg text-white" />
        </Link>
        {stats && (
          <span className="hidden text-xs text-white/70 md:inline">
            {stats.institutionCount} institutions
            {/* Omit the programmes clause entirely at 0 rather than
                advertise "0 verified programmes" -- a worse trust signal
                than not mentioning programmes at all. */}
            {stats.programmeCount > 0 ? ` · ${stats.programmeCount} verified programmes` : ""}
            {stats.lastVerifiedOn ? ` · updated ${stats.lastVerifiedOn}` : ""}
          </span>
        )}
        <div className="flex flex-wrap gap-1 text-sm font-medium">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded px-3 transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
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
