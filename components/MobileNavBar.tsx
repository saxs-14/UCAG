"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MOBILE_NAV_ITEMS = [
  { href: "/", label: "APS Calc", icon: "🎓" },
  { href: "/institutions", label: "Universities", icon: "🏛️" },
  { href: "/programmes", label: "Programmes", icon: "📚" },
  { href: "/bursaries", label: "Bursaries", icon: "💰" },
  { href: "/account", label: "Profile", icon: "👤" },
] as const;

export function MobileNavBar() {
  const pathname = usePathname();

  // Hide mobile navbar on admin pages
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav aria-label="Mobile Bottom Navigation" className="no-print fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-line bg-paper-raised/95 py-2 backdrop-blur-md shadow-lg sm:hidden">
      {MOBILE_NAV_ITEMS.map(({ href, label, icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-transform active:scale-95 ${
              active ? "text-brand-teal font-extrabold" : "text-ink-soft hover:text-ink font-medium"
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-[10px] tracking-tight">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
