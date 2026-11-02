import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/env/client";
import { listVerifiedProgrammeIds } from "@/lib/catalog/getRealProgrammeDetail";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/bursaries",
    "/internships",
    "/programmes",
    "/privacy",
    "/ump",
    "/ump/programmes",
    "/ump/funding",
    "/ump/learnerships",
    "/ump/careers",
    "/ump/campus",
    "/application/documents",
    "/institutions",
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