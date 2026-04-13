import { db } from "../../db/client";
import { advertisements } from "../../db/schema";
import { eq, sql, asc } from "drizzle-orm";

const PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page ?? 1);

    const offset = (page - 1) * PAGE_SIZE;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(advertisements)
        .where(eq(advertisements.isVisible, 1))
        .orderBy(asc(advertisements.order))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(advertisements)
        .where(eq(advertisements.isVisible, 1)),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return {
      statusCode: 200,
      message: "获取可见广告成功",
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
    console.error("获取可见广告失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取可见广告失败",
    });
  }
});

