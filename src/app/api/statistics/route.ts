import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { statistics, articles } from "@/server/db/schema";

export const runtime = "nodejs";

async function getTotalViews() {
  const [latest] = await db
    .select()
    .from(statistics)
    .orderBy(desc(statistics.date))
    .limit(1);

  return latest ? latest.totalViews : 0;
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const [todayStats] = await db
      .select()
      .from(statistics)
      .where(sql`DATE(${statistics.date}) = ${todayStr}`)
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

    return NextResponse.json({
      statusCode: 200,
      message: "获取统计数据成功",
      data: {
        totalViews,
        dailyViews: todayStats?.dailyViews ?? 0,
        totalArticles: Number(totalArticles || 0),
        totalArticleViews: Number(totalArticleViews || 0),
      },
    });
  } catch (error: unknown) {
    console.error("获取统计数据失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取统计数据失败" },
      { status: 500 },
    );
  }
}
