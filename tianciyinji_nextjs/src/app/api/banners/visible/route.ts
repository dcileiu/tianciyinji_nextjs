import { NextRequest, NextResponse } from "next/server";
import { eq, sql, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { banners } from "@/server/db/schema";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const offset = (page - 1) * PAGE_SIZE;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(banners)
        .where(eq(banners.isVisible, 1))
        .orderBy(asc(banners.order))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(banners)
        .where(eq(banners.isVisible, 1)),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return NextResponse.json({
      statusCode: 200,
      message: "获取可见轮播图成功",
      data: {
        data: rows,
        pagination: {
          current: page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      },
    });
  } catch (error: unknown) {
    console.error("获取可见轮播图失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取可见轮播图失败" },
      { status: 500 },
    );
  }
}
