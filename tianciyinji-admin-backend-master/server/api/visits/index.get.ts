import { db } from "../../db/client";
import { visits } from "../../db/schema";
import { desc, sql } from "drizzle-orm";
import { requireUser } from "../../utils/auth";

const PAGE_SIZE = 50;

export default defineEventHandler(async (event) => {
  requireUser(event); // 需要登录

  const query = getQuery(event);
  const page = Number(query.page ?? 1);

  const offset = (page - 1) * PAGE_SIZE;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(visits)
      .orderBy(desc(visits.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)`.as("total") }).from(visits),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    statusCode: 200,
    message: "获取访问记录成功",
    data: {
      data,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total: Number(total),
      },
    },
  };
});
