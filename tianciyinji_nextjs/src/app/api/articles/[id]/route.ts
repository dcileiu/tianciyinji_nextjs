import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { articles } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";
import { articleWithTags } from "@/server/articles/normalize";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (!id) {
    return NextResponse.json({
      statusCode: 200,
      message: "获取失败",
      error: "文章不存在",
    });
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!article) {
    return NextResponse.json({
      statusCode: 200,
      message: "获取失败",
      error: "文章不存在",
    });
  }

  return NextResponse.json({
    statusCode: 200,
    data: articleWithTags(article),
  });
}

interface UpdateArticleBody {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  coverImage?: string;
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
      error: "文章不存在",
    });
  }

  let body: UpdateArticleBody;
  try {
    body = (await request.json()) as UpdateArticleBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "无效请求体",
    });
  }

  const [existing] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "文章不存在",
    });
  }

  const updatePayload: Record<string, unknown> = { ...body };
  if (body.tags) {
    updatePayload.tags = body.tags.join(",");
  }
  if (typeof body.isPublished === "boolean") {
    updatePayload.isPublished = body.isPublished ? 1 : 0;
  }

  await db.update(articles).set(updatePayload).where(eq(articles.id, id));

  const [updated] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!updated) {
    return NextResponse.json({
      statusCode: 200,
      message: "更新失败",
      error: "文章不存在",
    });
  }

  return NextResponse.json({
    statusCode: 200,
    data: articleWithTags(updated),
  });
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
      error: "文章不存在",
    });
  }

  try {
    const result = await db.delete(articles).where(eq(articles.id, id));
    const affectedRows =
      (result as unknown as { affectedRows?: number })?.affectedRows ?? 0;

    if (affectedRows === 0) {
      return NextResponse.json({
        statusCode: 200,
        message: "删除失败",
        error: "文章不存在",
      });
    }

    return NextResponse.json({
      statusCode: 200,
      message: "删除成功",
      data: null,
    });
  } catch (error) {
    console.error("删除文章失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    });
  }
}
