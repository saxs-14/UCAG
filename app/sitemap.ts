import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/env/client";
import { SAMPLE_PROGRAMMES } from "@/config/sampleData";

/**
 * docs/MASTER_PROMPT_v2.md Phase 9: "sitemap -- learners find this
 * through search." Programme URLs come from SAMPLE_PROGRAMMES for now
 * (see app/programmes/[id]/page.tsx header) -- swapping in a real,
 * verified catalogue later is a data change, not a routing change.
 * Deliberately excludes /account (a form, not a landing page worth
 * indexing) and /admin (internal, also blocked in robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/bursaries", "/statistics", "/privacy"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
    })
  );

  const programmeRoutes: MetadataRoute.Sitemap = SAMPLE_PROGRAMMES.map((programme) => ({
    url: `${base}/programmes/${programme.id}`,
    lastModified: new Date(programme.verifiedOn),
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...programmeRoutes];
}
