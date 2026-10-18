"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

const GUEST_MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/institutions", label: "Universities", icon: "▦" },
  { href: "/programmes", label: "Programmes", icon: "▤" },
  { href: "/bursaries", label: "Funding", icon: "₊" },
  { href: "/login", label: "Sign in", icon: "◯" },
] as const;

const USER_MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "⌂" },
  { href: "/institutions", label: "Universities", icon: "▦" },
  { href: "/programmes", label: "Programmes", icon: "▤" },
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
      className="no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-paper-raised/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_28px_rgba(16,42,67,0.10)] backdrop-blur-xl sm:hidden"
    >
      {navItems.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${active ? "bg-brand-teal-soft text-brand-teal" : "text-ink-faint hover:bg-paper-overlay hover:text-ink"}`}
          >
            <span aria-hidden="true" className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
