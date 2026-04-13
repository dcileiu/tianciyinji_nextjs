import { db } from "../../db/client";
import { statistics, articles } from "../../db/schema";
import { desc, sql, eq } from "drizzle-orm";

async function getTotalViews() {
  const [latest] = await db
    .select()
    .from(statistics)
    .orderBy(desc(statistics.date))
    .limit(1);

  return latest ? latest.totalViews : 0;
}

export default defineEventHandler(async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const [todayStats] = await db
      .select()
      .from(statistics)
      .where(eq(statistics.date, todayStr))
      .limit(1);

    const totalViews = await getTotalViews();

    const [{ count: totalArticles }] = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(articles);

    const [{ total: totalArticleViews }] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${articles.views}), 0)`.as("total"),
      })
      .from(articles);

    return {
      statusCode: 200,
      message: "获取统计数据成功",
      data: {
        totalViews,
        dailyViews: todayStats?.dailyViews ?? 0,
        totalArticles: Number(totalArticles || 0),
        totalArticleViews: Number(totalArticleViews || 0),
      },
    };
  } catch (error: any) {
    console.error("获取统计数据失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "获取统计数据失败",
    });
  }
});

