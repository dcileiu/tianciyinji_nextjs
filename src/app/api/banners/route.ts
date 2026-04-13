import { NextRequest, NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { banners } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const offset = (page - 1) * PAGE_SIZE;

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(banners)
        .orderBy(asc(banners.order))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ total: sql<number>`COUNT(*)`.as("total") })
        .from(banners),
    ]);

    const total = Number(totalResult[0]?.total || 0);

    return NextResponse.json({
      statusCode: 200,
      message: "获取轮播图列表成功",
      data: {
        data: rows,
        pagination: {
          current: page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      },
    });
  } catch (error: unknown) {
    console.error("获取轮播图列表失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取轮播图列表失败" },
      { status: 500 },
    );
  }
}

interface CreateBannerBody {
  imageUrl: string;
  isVisible: boolean;
  order: number;
  title?: string;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let body: CreateBannerBody;
  try {
    body = (await request.json()) as CreateBannerBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "无效请求体",
    });
  }

  if (!body?.imageUrl) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "imageUrl 为必填项",
    });
  }

  try {
    const result = await db.insert(banners).values({
      imageUrl: body.imageUrl,
      isVisible: (body.isVisible ?? true) ? 1 : 0,
      order: body.order ?? 0,
      title: body.title ?? null,
      description: body.description ?? null,
      link: body.link ?? null,
      startTime: body.startTime ? new Date(body.startTime) : null,
      endTime: body.endTime ? new Date(body.endTime) : null,
    });

    const insertId = (result as unknown as { insertId: number }).insertId;
    let created: Record<string, unknown> = {
      imageUrl: body.imageUrl,
      isVisible: body.isVisible ?? true,
      order: body.order ?? 0,
      title: body.title ?? null,
      description: body.description ?? null,
      link: body.link ?? null,
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(banners)
        .where(eq(banners.id, insertId))
        .limit(1);
      if (row) created = row as Record<string, unknown>;
    }

    return NextResponse.json({ statusCode: 200, data: created });
  } catch (error) {
    console.error("创建横幅失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    });
  }
}
