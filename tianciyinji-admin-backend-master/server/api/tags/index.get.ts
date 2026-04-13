import { db } from "../../db/client";
import { tags } from "../../db/schema";
import { asc, sql } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page ?? 1);
    const pageSize = Number(query.pageSize ?? DEFAULT_PAGE_SIZE);

    const offset = (page - 1) * pageSize;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(tags)
        .orderBy(asc(tags.order))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(tags),
    ]);

    return {
      statusCode: 200,
      message: "获取标签列表成功",
      data: {
        data: rows,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  } catch (error: any) {
    console.error("获取标签列表失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取标签列表失败",
    });
  }
});

