import { MetadataRoute } from "next";
import { getPublishedArticlesForSitemap } from "@/server/queries/blog";

const baseUrl = "https://itianci.cn";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const rows = await getPublishedArticlesForSitemap();
    blogEntries = rows.map((row) => ({
      url: `${baseUrl}/blog/${row.id}`,
      lastModified: row.updatedAt ? new Date(row.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    /* 数据库未配置或不可用时仅返回静态页 */
  }

  return [...staticPages, ...blogEntries];
}
