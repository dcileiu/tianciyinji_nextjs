import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { banners } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

interface UpdateBannerBody {
  imageUrl?: string;
  isVisible?: boolean;
  order?: number;
  title?: string;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
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
      error: "横幅不存在",
    });
  }

  let body: UpdateBannerBody;
  try {
    body = (await request.json()) as UpdateBannerBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "无效请求体",
    });
  }

  const [current] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);

  if (!current) {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "横幅不存在",
    });
  }

  const updatePayload: Record<string, unknown> = { ...body };
  if (body.startTime) updatePayload.startTime = new Date(body.startTime);
  if (body.endTime) updatePayload.endTime = new Date(body.endTime);
  if (typeof body.isVisible === "boolean") {
    updatePayload.isVisible = body.isVisible ? 1 : 0;
  }

  await db.update(banners).set(updatePayload).where(eq(banners.id, id));

  const [updated] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
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
      error: "横幅不存在",
    });
  }

  try {
    const existing = await db
      .select({ id: banners.id })
      .from(banners)
      .where(eq(banners.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({
        statusCode: 200,
        message: "删除失败",
        error: "横幅不存在",
      });
    }

    await db.delete(banners).where(eq(banners.id, id));

    return NextResponse.json({
      statusCode: 200,
      message: "删除成功",
      data: null,
    });
  } catch (error) {
    console.error("删除横幅失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    });
  }
}
