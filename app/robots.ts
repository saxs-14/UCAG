import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/env/client";

/** /admin is blocked (internal, role-gated tool -- see app/admin/layout.tsx)
 * and /api/ (no page content, nothing to index). Everything else is a
 * public information page a learner might actually search for. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
