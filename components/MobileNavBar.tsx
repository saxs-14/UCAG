"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const GUEST_MOBILE_NAV_ITEMS = [
  { href: "/", label: "Check", icon: "⌂" },
  { href: "/institutions", label: "Universities", icon: "▦" },
  { href: "/programmes", label: "Programmes", icon: "▤" },
  { href: "/bursaries", label: "Funding", icon: "₊" },
  { href: "/login", label: "Profile", icon: "◯" },
] as const;

const USER_MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/institutions", label: "Universities", icon: "▦" },
  { href: "/programmes", label: "Degrees", icon: "▤" },
  { href: "/bursaries", label: "Funding", icon: "₊" },
  { href: "/account", label: "Profile", icon: "◯" },
] as const;

export function MobileNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  if (pathname.startsWith("/admin")) return null;

  const navItems = isLoggedIn ? USER_MOBILE_NAV_ITEMS : GUEST_MOBILE_NAV_ITEMS;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="no-print fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 border-t border-line bg-paper-raised/96 py-1.5 shadow-[0_-6px_24px_rgba(15,23,42,0.08)] backdrop-blur-md sm:hidden"
    >
      {navItems.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-bold ${active ? "text-brand-teal" : "text-ink-faint hover:text-ink"}`}
          >
            <span aria-hidden className="text-base leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
