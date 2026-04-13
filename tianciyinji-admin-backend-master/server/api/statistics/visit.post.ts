import { db } from "../../db/client";
import { statistics } from "../../db/schema";
import { desc, eq } from "drizzle-orm";

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

    if (!todayStats) {
      const totalViews = (await getTotalViews()) + 1;
      await db.insert(statistics).values({
        date: todayStr,
        dailyViews: 1,
        totalViews,
      });
    } else {
      await db
        .update(statistics)
        .set({
          dailyViews: todayStats.dailyViews + 1,
          totalViews: todayStats.totalViews + 1,
        })
        .where(eq(statistics.id, todayStats.id));
    }

    return {
      statusCode: 200,
      message: "记录访问成功",
      data: null,
    };
  } catch (error: any) {
    console.error("记录访问失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "记录访问失败",
    });
  }
});

