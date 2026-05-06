import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { tags } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

interface UpdateTagBody {
  title?: string;
  key?: string;
  order?: number;
  isVisible?: boolean;
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
      error: "标签不存在",
    });
  }

  let body: UpdateTagBody;
  try {
    body = (await request.json()) as UpdateTagBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "无效请求体",
    });
  }

  try {
    if (body.key) {
      const [existing] = await db
        .select()
        .from(tags)
        .where(eq(tags.key, body.key))
        .limit(1);

      if (existing && existing.id !== id) {
        return NextResponse.json({
          statusCode: 200,
          message: "更新失败",
          error: "标签已存在",
        });
      }
    }

    const [current] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (!current) {
      return NextResponse.json({
        statusCode: 200,
        message: "更新失败",
        error: "标签不存在",
      });
    }

    const payload: Record<string, unknown> = { ...body };
    if (typeof body.isVisible === "boolean") {
      payload.isVisible = body.isVisible ? 1 : 0;
    }
    await db.update(tags).set(payload).where(eq(tags.id, id));

    const [updated] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    return NextResponse.json({ statusCode: 200, data: updated });
  } catch (error) {
    console.error("更新标签失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "系统错误",
    });
  }
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
      error: "标签不存在",
    });
  }

  try {
    const existing = await db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        statusCode: 200,
        message: "删除失败",
        error: "标签不存在",
      });
    }

    await db.delete(tags).where(eq(tags.id, id));

    return NextResponse.json({
      statusCode: 200,
      message: "删除成功",
      data: null,
    });
  } catch (error) {
    console.error("删除标签失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    });
  }
}
