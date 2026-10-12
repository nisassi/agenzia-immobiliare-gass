import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getPublishedSlugs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/immobili`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/servizi`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/chi-siamo`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contatti`, changeFrequency: "monthly", priority: 0.6 },
  ];

  const slugs = await getPublishedSlugs();
  const propertyRoutes: MetadataRoute.Sitemap = slugs.map((item) => ({
    url: `${base}/immobili/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}
