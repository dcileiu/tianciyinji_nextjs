import { db } from "../../../db/client";
import { articles } from "../../../db/schema";
import { eq, sql } from "drizzle-orm";
import { getRouterParam } from "h3";

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
    const categoryParam = getRouterParam(event, "category");
    const query = getQuery(event);
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? DEFAULT_PAGE_SIZE);

    if (!categoryParam) {
      return {
        statusCode: 200,
        message: "获取失败",
        error: "分类参数不能为空",
      };
    }

    const offset = (page - 1) * pageSize;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(articles)
        .where(eq(articles.category, categoryParam))
        .where(eq(articles.isPublished, 1))
        .orderBy(sql`${articles.order} ASC, ${articles.createdAt} DESC`)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(articles)
        .where(eq(articles.category, categoryParam))
        .where(eq(articles.isPublished, 1)),
    ]);

    return {
      statusCode: 200,
      message: "获取分类文章列表成功",
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
    console.error("获取分类文章列表失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取分类文章列表失败",
    });
  }
});
