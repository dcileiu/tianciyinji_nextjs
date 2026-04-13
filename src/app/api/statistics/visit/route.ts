import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { statistics } from "@/server/db/schema";

export const runtime = "nodejs";

async function getTotalViews() {
  const [latest] = await db
    .select()
    .from(statistics)
    .orderBy(desc(statistics.date))
    .limit(1);

  return latest ? latest.totalViews : 0;
}

export async function POST() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    const [todayStats] = await db
      .select()
      .from(statistics)
      .where(sql`DATE(${statistics.date}) = ${todayStr}`)
      .limit(1);

    if (!todayStats) {
      const totalViews = (await getTotalViews()) + 1;
      await db.insert(statistics).values({
        date: new Date(`${todayStr}T00:00:00.000Z`),
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

    return NextResponse.json({
      statusCode: 200,
      message: "记录访问成功",
      data: null,
    });
  } catch (error: unknown) {
    console.error("记录访问失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "记录访问失败" },
      { status: 500 },
    );
  }
}
