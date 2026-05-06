import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { categories } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

interface UpdateCategoryBody {
  name?: string;
  key?: string;
  order?: number;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!id) {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "分类不存在",
    });
  }

  let body: UpdateCategoryBody;
  try {
    body = (await request.json()) as UpdateCategoryBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "无效请求体",
    });
  }

  const [current] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!current) {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "分类不存在",
    });
  }

  await db.update(categories).set(body).where(eq(categories.id, id));

  const [updated] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return NextResponse.json({ statusCode: 200, data: updated });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!id) {
    return NextResponse.json({
      statusCode: 200,
      message: "删除失败",
      error: "分类不存在",
    });
  }

  try {
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        statusCode: 200,
        message: "删除失败",
        error: "分类不存在",
      });
    }

    await db.delete(categories).where(eq(categories.id, id));

    return NextResponse.json({
      statusCode: 200,
      message: "删除成功",
      data: null,
    });
  } catch (error) {
    console.error("删除分类失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    });
  }
}
