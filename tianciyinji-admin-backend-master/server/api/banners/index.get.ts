import { db } from "../../db/client";
import { banners } from "../../db/schema";
import { sql, asc } from "drizzle-orm";

const PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page ?? 1);

    const offset = (page - 1) * PAGE_SIZE;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(banners)
        .orderBy(asc(banners.order))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(banners),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return {
      statusCode: 200,
      message: "获取轮播图列表成功",
      data: {
        data: rows,
        pagination: {
          current: page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      },
    };
  } catch (error: any) {
    console.error("获取轮播图列表失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取轮播图列表失败",
    });
  }
});

