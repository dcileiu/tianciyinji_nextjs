import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";
import { articleWithTags } from "@/server/articles/normalize";

export const runtime = "nodejs";

const DEFAULT_PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  const [rows, totalResult] = await Promise.all([
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

  const total = Number(totalResult[0]?.total || 0);

  return NextResponse.json({
    statusCode: 200,
    message: "获取文章列表成功",
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
}
