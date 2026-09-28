import type { MetadataRoute } from "next";
import { allRoutes } from "@/data/navigation";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return allRoutes.map((route) => ({
    url: `${siteUrl}${route === "/" ? "" : route}`,
    changeFrequency: route === "/" || route === "/speakers" || route === "/partners" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/register" ? 0.9 : 0.7,
  }));
}
