import { NextRequest, NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { tags } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

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
        .from(tags)
        .orderBy(asc(tags.order))
        .limit(pageSize)
        .offset(offset),
      db.select({ total: sql<number>`COUNT(*)`.as("total") }).from(tags),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return NextResponse.json({
      statusCode: 200,
      message: "获取标签列表成功",
      data: {
        data: rows,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error: unknown) {
    console.error("获取标签列表失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取标签列表失败" },
      { status: 500 },
    );
  }
}

interface CreateTagBody {
  title: string;
  key: string;
  order: number;
  isVisible: boolean;
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let body: CreateTagBody;
  try {
    body = (await request.json()) as CreateTagBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "无效请求体",
    });
  }

  if (!body?.title || !body?.key) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "标签名称和 key 为必填项",
    });
  }

  try {
    const [existing] = await db
      .select()
      .from(tags)
      .where(eq(tags.key, body.key))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        statusCode: 200,
        message: "创建失败",
        error: "标签已存在",
      });
    }

    const result = await db.insert(tags).values({
      title: body.title,
      key: body.key,
      order: body.order ?? 0,
      isVisible: (body.isVisible ?? true) ? 1 : 0,
    });

    const insertId = (result as unknown as { insertId: number }).insertId;
    let created: Record<string, unknown> = {
      title: body.title,
      key: body.key,
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(tags)
        .where(eq(tags.id, insertId))
        .limit(1);
      if (row) created = row as Record<string, unknown>;
    }

    return NextResponse.json({ statusCode: 200, data: created });
  } catch (error) {
    console.error("创建标签失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    });
  }
}
