// cSpell:words prerendered studymate
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
 *
 * Unlike /bursaries, /statistics, /programmes/[id] (all `force-dynamic`),
 * this route is statically prerendered at build time -- so if
 * listVerifiedProgrammeIds() throws (e.g. FIREBASE_ADMIN_* unset in a
 * given Vercel environment), it takes the *entire deployment* down, not
 * just this page. Same "degrade rather than crash" call already made for
 * the client AuthProvider when no real Firebase project is configured
 * (see lib/firebase/client.ts) -- a sitemap missing programme URLs is a
 * far smaller problem than every route 404ing because the build failed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/bursaries",
    "/statistics",
    "/privacy",
    "/ump",
    "/ump/programmes",
    "/ump/funding",
    "/ump/careers",
    "/ump/campus",
    "/ump/mentors",
    "/application/documents",
    "/institutions",
    "/account/parent",
    "/account/mentor",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
  }));

  const verifiedProgrammes = await listVerifiedProgrammeIds().catch((error: unknown) => {
    console.warn("sitemap: skipping programme URLs, Firebase Admin unavailable:", error);
    return [];
  });
  const programmeRoutes: MetadataRoute.Sitemap = verifiedProgrammes.map(({ id, verifiedOn }) => ({
    url: `${base}/programmes/${id}`,
    lastModified: new Date(verifiedOn),
    changeFrequency: "weekly",
  }));

  return [...staticRoutes, ...programmeRoutes];
}
