import { db } from "../../db/client";
import { categories } from "../../db/schema";
import { asc } from "drizzle-orm";

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
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.order));

    return {
      statusCode: 200,
      message: "获取分类列表成功",
      data: rows,
    };
  } catch (error: any) {
    console.error("获取分类列表失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取分类列表失败",
    });
  }
});

