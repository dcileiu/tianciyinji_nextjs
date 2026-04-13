import { db } from "../../db/client";
import { tasks } from "../../db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { requireUser } from "../../utils/auth";

const PAGE_SIZE = 20;

export default defineEventHandler(async (event) => {
  requireUser(event); // 需要登录

  const query = getQuery(event);
  const page = Number(query.page ?? 1);
  const isCompleted = query.isCompleted
    ? query.isCompleted === "true"
    : undefined;

  const offset = (page - 1) * PAGE_SIZE;

  const whereCondition = isCompleted !== undefined
    ? eq(tasks.isCompleted, isCompleted ? 1 : 0)
    : undefined;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(tasks)
      .where(whereCondition)
      .orderBy(desc(tasks.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)`.as("total") })
      .from(tasks)
      .where(whereCondition),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    statusCode: 200,
    message: "获取任务列表成功",
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
