import type { MetadataRoute } from "next";
import { siteConfig } from "@/src/config/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/sign-in",
          "/signin-with-chatgpt",
          "/signout-with-chatgpt",
          "/callback",
          "/preview",
          "/debug",
          "/private",
        ],
      },
    ],
    sitemap: `${siteConfig.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
