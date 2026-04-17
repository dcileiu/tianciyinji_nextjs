import { MetadataRoute } from "next";

/**
 * 只有前台需要被搜索引擎 + AI 搜索（GEO）收录；
 * /admin/* 与 /api/* 对所有爬虫（包括 LLM 爬虫）禁抓。
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://itianci.cn";

  /** 主流 LLM / AI 搜索爬虫 UA，显式允许抓取公开内容（GEO） */
  const aiCrawlers = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Googlebot-News",
    "Applebot",
    "Applebot-Extended",
    "Bytespider",
    "CCBot",
    "cohere-ai",
    "DuckAssistBot",
    "Amazonbot",
    "Meta-ExternalAgent",
    "YouBot",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*", "/admin/*", "/private/*"],
      },
      ...aiCrawlers.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/api/*", "/admin/*", "/private/*"],
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
