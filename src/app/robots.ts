import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The dashboard must never be indexed.
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
    host: env.siteUrl,
  };
}
