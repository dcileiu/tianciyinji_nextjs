import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";

export const runtime = "nodejs";

/** 公开调用：记录一次阅读（避免 GET 详情在 SSR+元数据时重复计数） */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!id) {
    return NextResponse.json({
      statusCode: 200,
      message: "记录失败",
      error: "文章不存在",
    });
  }

  const [row] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.isPublished, 1)))
    .limit(1);

  if (!row) {
    return NextResponse.json({
      statusCode: 200,
      message: "记录失败",
      error: "文章不存在",
    });
  }

  await db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.id, id));

  return NextResponse.json({
    statusCode: 200,
    message: "ok",
    data: null,
  });
}
