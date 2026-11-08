"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, BookOpen, Wallet, UserCircle, LogIn } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const GUEST_MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/institutions", label: "Universities", Icon: GraduationCap },
  { href: "/programmes", label: "Programmes", Icon: BookOpen },
  { href: "/bursaries", label: "Funding", Icon: Wallet },
  { href: "/login", label: "Sign in", Icon: LogIn },
] as const;

const USER_MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/institutions", label: "Universities", Icon: GraduationCap },
  { href: "/programmes", label: "Programmes", Icon: BookOpen },
  { href: "/bursaries", label: "Funding", Icon: Wallet },
  { href: "/account", label: "Profile", Icon: UserCircle },
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
      className="glass-blur-strong no-print fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-glass-border bg-glass-surface-strong px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:hidden"
    >
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] font-black transition-colors ${
              active
                ? "bg-brand-teal/10 text-brand-teal shadow-2xs"
                : "text-ink-faint hover:bg-slate-soft hover:text-ink"
            }`}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}