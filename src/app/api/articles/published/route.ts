import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";
import { articleWithTags } from "@/server/articles/normalize";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE);
    const offset = (page - 1) * pageSize;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(articles)
        .where(eq(articles.isPublished, 1))
        .orderBy(sql`${articles.order} ASC, ${articles.createdAt} DESC`)
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(articles)
        .where(eq(articles.isPublished, 1)),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return NextResponse.json({
      statusCode: 200,
      message: "获取已发布文章列表成功",
      data: {
        data: rows.map(articleWithTags),
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error: unknown) {
    console.error("获取已发布文章列表失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取已发布文章列表失败" },
      { status: 500 },
    );
  }
}
