import { db } from "../../db/client";
import { advertisements } from "../../db/schema";
import { eq, sql, asc } from "drizzle-orm";

const PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as { page?: string; visible?: string };
    const page = Number(query.page ?? 1);
    const hasVisibleParam = Object.prototype.hasOwnProperty.call(
      query,
      "visible",
    );

    const offset = (page - 1) * PAGE_SIZE;

    let rows;
    let totalRow;

    if (hasVisibleParam) {
      // 只获取可见广告
      [rows, [totalRow]] = await Promise.all([
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
    } else {
      // 获取全部
      [rows, [totalRow]] = await Promise.all([
        db
          .select()
          .from(advertisements)
          .orderBy(asc(advertisements.order))
          .limit(PAGE_SIZE)
          .offset(offset),
        db
          .select({ total: sql<number>`COUNT(*)`.as("total") })
          .from(advertisements),
      ]);
    }

    const total = Number(totalRow?.total || 0);

    return {
      statusCode: 200,
      message: "获取广告列表成功",
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
    console.error("获取广告列表失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取广告列表失败",
    });
  }
});

