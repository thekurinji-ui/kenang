import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    "/about",
    "/features",
    "/harga",
    "/faq",
    "/blog",
    "/contact",
    "/help",
    "/privacy",
    "/terms",
    "/cookies",
    "/refund-policy",
    "/copyright",
    "/photo-consent",
    "/data-deletion",
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route === "/" ? "" : route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
