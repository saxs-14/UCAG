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

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="no-print flex gap-1 border-b border-line bg-paper-raised px-4 text-sm font-medium">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-t-lg border-b-2 px-2 transition-all duration-200 hover:-translate-y-0.5 ${
              active
                ? "border-brand-coral text-brand-teal"
                : "border-transparent text-ink-soft hover:border-brand-coral hover:text-brand-teal"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
