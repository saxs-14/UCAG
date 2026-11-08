"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

/**
 * Staff/admin accounts stay admin-only -- they never get the learner
 * experience (calculator, programme browsing, shortlist, bursaries).
 * This is enforced here, not just by hiding nav links: an admin who
 * types/bookmarks a learner URL directly gets bounced straight back to
 * /admin. /privacy stays reachable since it's a legal notice everyone
 * (including staff) can legitimately need, and it carries no learner
 * data of its own.
 *
 * Waits for adminClaimsReady so a learner account isn't bounced during
 * the brief window before their (non-admin) claim resolves.
 */
const ADMIN_ALLOWED_PREFIXES = ["/admin", "/privacy"];

export function AdminRedirect() {
  const { isAdmin, adminClaimsReady, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading || !adminClaimsReady || !isAdmin) return;
    const allowed = ADMIN_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!allowed) router.replace("/admin");
  }, [isAdmin, adminClaimsReady, loading, pathname, router]);

  return null;
}
