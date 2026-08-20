"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, Landmark, LogIn, User, Wallet } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { LABELS } from "@/config/labels";

const GUEST_MOBILE_NAV_ITEMS = [
  { href: "/", label: "APS Calc", icon: GraduationCap },
  { href: "/institutions", label: LABELS.nav.institutions, icon: Landmark },
  { href: "/programmes", label: "Programmes", icon: BookOpen },
  { href: "/bursaries", label: "Bursaries", icon: Wallet },
  { href: "/login", label: "Sign In", icon: LogIn },
] as const;

const USER_MOBILE_NAV_ITEMS = [
  { href: "/", label: "APS Calc", icon: GraduationCap },
  { href: "/institutions", label: LABELS.nav.institutions, icon: Landmark },
  { href: "/programmes", label: "Programmes", icon: BookOpen },
  { href: "/bursaries", label: "Bursaries", icon: Wallet },
  { href: "/account", label: "Profile", icon: User },
] as const;

export function MobileNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  // Hide mobile navbar on admin pages
  if (pathname.startsWith("/admin")) return null;

  const navItems = isLoggedIn ? USER_MOBILE_NAV_ITEMS : GUEST_MOBILE_NAV_ITEMS;

  return (
    <nav aria-label="Mobile Bottom Navigation" className="no-print fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-line bg-paper-raised/95 py-2 backdrop-blur-md shadow-lg sm:hidden">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center justify-center gap-0.5 px-3 py-1 transition-transform active:scale-95 ${
              active ? "text-brand-teal font-extrabold" : "text-ink-soft hover:text-ink font-medium"
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
