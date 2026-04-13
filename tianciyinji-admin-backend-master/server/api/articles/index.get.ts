import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { sql, desc } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 10;

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

  try {
    const query = getQuery(event);
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? DEFAULT_PAGE_SIZE);

    const offset = (page - 1) * pageSize;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(articles)
        .orderBy(desc(articles.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(articles),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return {
      statusCode: 200,
      message: "获取文章列表成功",
      data: {
        data: rows.map((row) => ({
          ...row,
          tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
        })),
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  } catch (error: any) {
    console.error("获取文章列表失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取文章列表失败",
    });
  }
});

