import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/env/client";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}