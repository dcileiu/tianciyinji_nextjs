import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  // 设置 CORS 头
  setHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  // 处理 OPTIONS 预检请求
  if (event.method === "OPTIONS") {
    return {};
  }

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!id) {
    return {
      statusCode: 200,
      message: "获取失败",
      error: "文章不存在",
    };
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!article) {
    return {
      statusCode: 200,
      message: "获取失败",
      error: "文章不存在",
    };
  }

  // 增加阅读数
  await db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.id, id));

  const normalized = {
    ...article,
    tags: article.tags ? article.tags.split(",").filter(Boolean) : [],
  };

  return {
    statusCode: 200,
    data: normalized,
  };
});

