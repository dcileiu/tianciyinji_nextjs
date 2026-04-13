import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";
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
        .orderBy(desc(articles.createdAt))
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
  } catch (error: unknown) {
    console.error("获取文章列表失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取文章列表失败" },
      { status: 500 },
    );
  }
}

interface CreateArticleBody {
  title: string;
  content?: string;
  category: string;
  tags: string[];
  isPublished?: boolean;
  coverImage?: string;
  order?: number;
}

function normalizeArticlePayload(body: CreateArticleBody) {
  return {
    title: body.title,
    content: body.content ?? "",
    category: body.category,
    tags: (body.tags ?? []).join(","),
    isPublished: (body.isPublished ?? true) ? 1 : 0,
    coverImage:
      body.coverImage ?? "http://p1.qhimg.com/t01b4d0943444706854.jpg",
    order: body.order ?? 0,
  };
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let body: CreateArticleBody;
  try {
    body = (await request.json()) as CreateArticleBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "无效请求体",
    });
  }

  if (!body?.title || !body?.category) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "标题和分类为必填项",
    });
  }

  try {
    const payload = normalizeArticlePayload(body);
    const result = await db.insert(articles).values(payload);
    const insertId = (result as unknown as { insertId: number }).insertId;

    let created: Record<string, unknown> = payload as unknown as Record<
      string,
      unknown
    >;
    if (insertId) {
      const [row] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, insertId))
        .limit(1);
      if (row) created = row as Record<string, unknown>;
    }

    const tags =
      typeof created.tags === "string"
        ? created.tags.split(",").filter(Boolean)
        : [];

    return NextResponse.json({
      statusCode: 200,
      data: { ...created, tags },
    });
  } catch (error) {
    console.error("创建文章失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    });
  }
}
