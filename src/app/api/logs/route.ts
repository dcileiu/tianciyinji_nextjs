import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { logs } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 50);
  const level = searchParams.get("level") ?? undefined;
  const offset = (page - 1) * pageSize;

  const whereLevel = level ? eq(logs.level, level) : undefined;

  const [data, totalResult] = await Promise.all([
    whereLevel
      ? db
          .select()
          .from(logs)
          .where(whereLevel)
          .orderBy(desc(logs.createdAt))
          .limit(pageSize)
          .offset(offset)
      : db
          .select()
          .from(logs)
          .orderBy(desc(logs.createdAt))
          .limit(pageSize)
          .offset(offset),
    whereLevel
      ? db
          .select({ total: sql<number>`COUNT(*)`.as("total") })
          .from(logs)
          .where(whereLevel)
      : db.select({ total: sql<number>`COUNT(*)`.as("total") }).from(logs),
  ]);

  const total = Number(totalResult[0]?.total || 0);

  return NextResponse.json({
    statusCode: 200,
    message: "获取日志列表成功",
    data: {
      data,
      pagination: {
        page,
        pageSize,
        total,
      },
    },
  });
}

interface CreateLogBody {
  level: string;
  message: string;
  meta?: unknown;
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let body: CreateLogBody;
  try {
    body = (await request.json()) as CreateLogBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "无效请求体",
    });
  }

  if (!body?.level || !body?.message) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建失败",
      error: "level 与 message 为必填项",
    });
  }

  await db.insert(logs).values({
    level: body.level,
    message: body.message,
    meta: body.meta ?? null,
    userId: user.id,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] ?? null,
    userAgent: request.headers.get("user-agent") ?? null,
  });

  return NextResponse.json({
    statusCode: 200,
    message: "创建成功",
    data: null,
  });
}
