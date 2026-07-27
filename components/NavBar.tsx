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

/** Wraps the active link in the same hand-drawn double-ellipse mark as
 * CircledMark/StampBadge -- "here's where you are" told the same way
 * "here's your score" is told everywhere else in the app, instead of a
 * flat underline bar that says nothing about the app's own visual
 * language. preserveAspectRatio="none" lets one path stretch to fit
 * whatever label it's wrapping, same trick as CircledMark. */
function ActiveMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 44" preserveAspectRatio="none" className="absolute inset-0 -z-10 h-full w-full overflow-visible text-brand-coral">
      <path
        d="M4,24 C2,8 22,2 50,3 C80,4 98,10 96,24 C94,38 72,42 48,41 C20,40 6,36 4,24 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
    </svg>
  );
}

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="no-print flex gap-2 border-b border-line bg-paper-raised px-4 py-1 text-sm font-medium">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-11 items-center px-3 transition-all duration-200 hover:-translate-y-0.5 ${
              active ? "text-brand-coral" : "text-ink-soft hover:text-brand-teal"
            }`}
          >
            {active && <ActiveMark />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
