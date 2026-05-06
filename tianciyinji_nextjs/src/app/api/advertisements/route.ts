import { NextRequest, NextResponse } from "next/server";
import { eq, sql, asc } from "drizzle-orm";
import { db } from "@/server/db/client";
import { advertisements } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? 1);
    const hasVisibleParam = searchParams.has("visible");
    const offset = (page - 1) * PAGE_SIZE;

    let rows;
    let totalRow: { total: number } | undefined;

    if (hasVisibleParam) {
      [rows, [totalRow]] = await Promise.all([
        db
          .select()
          .from(advertisements)
          .where(eq(advertisements.isVisible, 1))
          .orderBy(asc(advertisements.order))
          .limit(PAGE_SIZE)
          .offset(offset),
        db
          .select({ total: sql<number>`COUNT(*)`.as("total") })
          .from(advertisements)
          .where(eq(advertisements.isVisible, 1)),
      ]);
    } else {
      [rows, [totalRow]] = await Promise.all([
        db
          .select()
          .from(advertisements)
          .orderBy(asc(advertisements.order))
          .limit(PAGE_SIZE)
          .offset(offset),
        db
          .select({ total: sql<number>`COUNT(*)`.as("total") })
          .from(advertisements),
      ]);
    }

    const total = Number(totalRow?.total || 0);

    return NextResponse.json({
      statusCode: 200,
      message: "获取广告列表成功",
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
    console.error("获取广告列表失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "获取广告列表失败" },
      { status: 500 },
    );
  }
}

interface CreateAdvertisementBody {
  title: string;
  imageUrl: string;
  position: string;
  order: number;
  isVisible: boolean;
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

  let body: CreateAdvertisementBody;
  try {
    body = (await request.json()) as CreateAdvertisementBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "无效请求体",
    });
  }

  if (!body?.title || !body?.imageUrl || !body?.position) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "title、imageUrl 和 position 为必填项",
    });
  }

  try {
    const startTime = body.startTime ? new Date(body.startTime) : new Date();
    const endTime =
      body.endTime ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.insert(advertisements).values({
      title: body.title,
      imageUrl: body.imageUrl,
      position: body.position,
      order: body.order ?? 0,
      isVisible: (body.isVisible ?? true) ? 1 : 0,
      description: body.description ?? null,
      link: body.link ?? null,
      startTime,
      endTime: new Date(endTime),
    });

    const insertId = (result as unknown as { insertId: number }).insertId;
    let created: Record<string, unknown> = {
      title: body.title,
      imageUrl: body.imageUrl,
      position: body.position,
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
      description: body.description ?? null,
      link: body.link ?? null,
      startTime,
      endTime: new Date(endTime),
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(advertisements)
        .where(eq(advertisements.id, insertId))
        .limit(1);
      if (row) created = row as Record<string, unknown>;
    }

    return NextResponse.json({ statusCode: 200, data: created });
  } catch (error) {
    console.error("创建广告失败:", error);
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    });
  }
}
