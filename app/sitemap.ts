import type { MetadataRoute } from "next";
import { blogPosts } from "@/src/data/blog";
import { industries } from "@/src/data/industries";
import { resources } from "@/src/data/resources";
import { solutions } from "@/src/data/solutions";
import { absoluteUrl } from "@/src/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/pricing",
    "/download",
    "/about-us",
    "/career",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/cookie-policy",
    "/solutions",
    "/industries",
    "/resources",
    "/blog",
    "/faq",
    "/documentation",
    "/help-center",
    "/en",
    "/bn",
  ];

  const dynamicRoutes = [
    ...solutions.map((item) => `/solutions/${item.slug}`),
    ...industries.map((item) => `/industries/${item.slug}`),
    ...resources.map((item) => `/resources/${item.slug}`),
    ...blogPosts.map((item) => `/blog/${item.slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date("2026-07-22"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/download" ? 0.9 : 0.7,
  }));
}
