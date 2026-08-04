import type { MetadataRoute } from "next";
import { comparisons } from "./comparisons";
import { getSiteUrl } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const routes = [
    "/",
    "/privacy",
    ...comparisons.map((item) => `/compare/${item.slug}`),
  ];

  return routes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/privacy" ? 0.8 : 0.7,
  }));
}
