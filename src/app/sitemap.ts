// Rendered once at build time (static export).
export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { allRoutes } from "@/data/navigation";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes.map((route) => ({
    // trailingSlash export: /register/ is the served URL (no redirect hop).
    url: `${siteUrl}${route === "/" ? "/" : `${route}/`}`,
    changeFrequency: route === "/" || route === "/speakers" || route === "/partners" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/register" ? 0.9 : 0.7,
  }));
}
