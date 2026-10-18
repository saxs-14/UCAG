"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LABELS } from "@/config/labels";
import { useAuth } from "@/components/auth/AuthProvider";

// Three top-level destinations only -- "UMP hub" was a leftover from the
// v1 UMP-only app and is redundant now that University of Mpumalanga is
// just one of the 12 seeded institutions, reachable from /institutions.
// A learner opening this nav cold should see a short, obvious list, not a
// menu that requires already knowing what "UMP" means.
const PUBLIC_NAV_ITEMS = [
  { href: "/", label: LABELS.nav.calculator },
  { href: "/programmes", label: LABELS.nav.programmes },
  { href: "/bursaries", label: LABELS.nav.bursaries },
];

export function NavBar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isLoggedIn = !!user && !user.isAnonymous;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-paper-raised/95 text-ink shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8" aria-label="Primary navigation">
        <Link href="/" className="flex min-h-11 shrink-0 items-center text-ink" aria-label="UCAG home">
          <Logo size={34} wordmarkClassName="text-lg font-black tracking-tight text-ink" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
          {PUBLIC_NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-10 rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${active ? "bg-brand-teal-soft text-brand-teal" : "text-ink-soft hover:bg-paper-overlay hover:text-ink"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* stats pill removed: a raw institution count was chrome, not
            navigation -- it told a learner nothing actionable */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!loading && (isLoggedIn ? (
            <Link
              href="/account"
              className={`inline-flex min-h-10 items-center rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${pathname === "/account" ? "bg-brand-teal text-white" : "text-ink-soft hover:bg-paper-overlay hover:text-ink"}`}
            >
              Profile
            </Link>
          ) : (
            // One CTA, not two -- "Create account" duplicated "Sign in" (the
            // login page itself offers to register). Hidden in installed
            // app mode on narrow widths: MobileNavBar's own "Sign in" tab
            // already covers that case there, so showing both is redundant
            // screen space in a standalone app shell.
            <Link href="/login" className="app-mode-hide-narrow inline-flex min-h-10 items-center rounded-xl bg-brand-teal px-3.5 py-2 text-xs font-black text-white transition-colors hover:bg-brand-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">Sign in</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
