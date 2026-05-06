/**
 * llms.txt —— 面向大模型/AI 搜索的站点说明（GEO 优化）
 * 参考规范：https://llmstxt.org/
 * 仅前台公开内容参与；后台 /admin 与所有 /api 均不对外暴露。
 */
import { NextResponse } from "next/server";
import { getPublishedArticlesForSitemap } from "@/server/queries/blog";

export const runtime = "nodejs";
export const revalidate = 3600;

const BASE = "https://itianci.cn";

export async function GET() {
  let articleLines = "";
  try {
    const rows = await getPublishedArticlesForSitemap();
    articleLines = rows
      .slice(0, 200)
      .map((r) => `- [Article #${r.id}](${BASE}/blog/${r.id})`)
      .join("\n");
  } catch {
    articleLines = "";
  }

  const body = `# 天赐印记 (itianci.cn)

> Tianci 的个人网站，分享前端开发技术文章与项目作品；技术栈聚焦 React / Next.js / TypeScript / Node.js。

## About
- Site: ${BASE}
- Author: Tianci
- Language: zh-CN
- Topics: 前端开发, React, Next.js, TypeScript, JavaScript, Node.js, Web 性能, 工程化

## Primary pages
- [Home](${BASE}/)
- [Blog](${BASE}/blog)
- [Portfolio](${BASE}/portfolio)

## Machine-readable
- Sitemap: ${BASE}/sitemap.xml
- Robots:  ${BASE}/robots.txt
- Feed:    ${BASE}/sitemap.xml (use this for crawling)

## Blog articles
${articleLines || `(see ${BASE}/sitemap.xml)`}

## Policy for AI crawlers
- Public pages (everything except /admin/* and /api/*) may be crawled and quoted with attribution linking back to the canonical URL.
- Do not crawl /admin/* or /api/* — these are private management endpoints.
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
