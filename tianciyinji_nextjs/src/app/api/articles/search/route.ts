import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";
import { articleWithTags } from "@/server/articles/normalize";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

interface SearchBody {
  keyword?: string;
  page?: number;
}

export async function POST(request: NextRequest) {
  let body: SearchBody;
  try {
    body = (await request.json()) as SearchBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      data: {
        data: [],
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }

  if (!body?.keyword) {
    return NextResponse.json({
      statusCode: 200,
      data: {
        data: [],
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }

  const keyword = body.keyword;
  const likePattern = `%${keyword}%`;

  try {
    const rows = await db
      .select()
      .from(articles)
      .where(
        sql`${articles.title} LIKE ${likePattern} OR ${articles.content} LIKE ${likePattern} OR ${articles.tags} LIKE ${likePattern}`,
      )
      .orderBy(sql`${articles.createdAt} DESC`);

    return NextResponse.json({
      statusCode: 200,
      data: {
        data: rows.map(articleWithTags),
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: rows.length,
          totalPages: 1,
        },
      },
    });
  } catch (error) {
    console.error("搜索文章失败:", error);
    return NextResponse.json({
      statusCode: 200,
      data: {
        data: [],
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }
}
