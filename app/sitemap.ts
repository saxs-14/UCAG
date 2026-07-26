import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/env/client";
import { listVerifiedProgrammeIds } from "@/lib/catalog/getRealProgrammeDetail";

/**
 * docs/MASTER_PROMPT_v2.md Phase 9: "sitemap -- learners find this
 * through search." Programme URLs come from the real, verified catalogue
 * (lib/catalog/getRealProgrammeDetail.ts) -- config/sampleData.ts's
 * fictional SAMPLE_PROGRAMMES is gone from this file entirely.
 * Deliberately excludes /account (a form, not a landing page worth
 * indexing) and /admin (internal, also blocked in robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/bursaries", "/statistics", "/privacy"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
    })
  );

  const verifiedProgrammes = await listVerifiedProgrammeIds();
  const programmeRoutes: MetadataRoute.Sitemap = verifiedProgrammes.map(({ id, verifiedOn }) => ({
    url: `${base}/programmes/${id}`,
    lastModified: new Date(verifiedOn),
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...programmeRoutes];
}
