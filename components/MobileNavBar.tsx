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
      className="no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line/60 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden"
    >
      {navItems.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-black transition-colors ${
              active 
                ? "bg-brand-teal/10 text-brand-teal shadow-2xs" 
                : "text-slate-400 hover:bg-slate-50 hover:text-ink"
            }`}
          >
            <span aria-hidden="true" className="text-xl leading-none">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}