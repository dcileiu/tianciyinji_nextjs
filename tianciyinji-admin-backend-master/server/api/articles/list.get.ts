import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { sql } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? DEFAULT_PAGE_SIZE);

  const offset = (page - 1) * pageSize;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(articles)
      .orderBy(sql`${articles.order} ASC`)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)`.as("total") })
      .from(articles),
  ]);

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
});

