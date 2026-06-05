import type { MetadataRoute } from "next";
import { safe } from "@/lib/safe";
import { siteConfig } from "@/lib/site";
import { listApis } from "@/server/services/apis";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const apis = await safe(() => listApis(), []);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/apis",
    "/pricing",
    "/hot",
    "/tools",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const apiRoutes: MetadataRoute.Sitemap = apis.map((api) => ({
    url: `${base}/apis/${api.slug}`,
    lastModified: api.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...apiRoutes];
}
