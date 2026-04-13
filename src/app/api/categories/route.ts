import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { categories } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.order));

    return NextResponse.json({
      statusCode: 200,
      message: "获取分类列表成功",
      data: rows,
    });
  } catch (error: unknown) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取分类列表失败" },
      { status: 500 },
    );
  }
}

interface CreateCategoryBody {
  name: string;
  key: string;
  order: number;
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let body: CreateCategoryBody;
  try {
    body = (await request.json()) as CreateCategoryBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "无效请求体",
    });
  }

  if (!body?.name || !body?.key) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "分类名称和 key 为必填项",
    });
  }

  try {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.key, body.key))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        statusCode: 200,
        message: "创建失败",
        error: "分类已存在",
      });
    }

    const result = await db.insert(categories).values({
      name: body.name,
      key: body.key,
      order: body.order ?? 0,
    });

    const insertId = (result as unknown as { insertId: number }).insertId;
    let created: Record<string, unknown> = {
      name: body.name,
      key: body.key,
      order: body.order ?? 0,
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, insertId))
        .limit(1);
      if (row) created = row as Record<string, unknown>;
    }

    return NextResponse.json({ statusCode: 200, data: created });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    });
  }
}
