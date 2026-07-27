"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LABELS } from "@/config/labels";

const NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/bursaries", label: LABELS.nav.bursaries },
  { href: "/statistics", label: LABELS.nav.statistics },
  { href: "/account", label: LABELS.nav.profile },
];

/**
 * A real site header: solid institutional band, wordmark on the left,
 * navigation on the right, present on every page -- not just something
 * that appears as page-body text on "/". Previously the app name only
 * ever showed up as a large centered heading on the home page; every
 * other page had no persistent identity at the top at all, which is
 * part of why the site didn't read as "a website" (a CSIR page always
 * shows its header/logo, no matter which section you're on).
 */
export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="no-print brand-band">
      <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center text-lg font-bold tracking-tight text-white">
          {LABELS.app.name}
        </Link>
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
