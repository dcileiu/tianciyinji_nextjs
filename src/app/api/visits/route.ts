import { NextRequest, NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { visits } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(visits)
      .orderBy(desc(visits.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db.select({ total: sql<number>`COUNT(*)`.as("total") }).from(visits),
  ]);

  const total = totalResult[0]?.total || 0;

  return NextResponse.json({
    statusCode: 200,
    message: "获取访问记录成功",
    data: {
      data,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total: Number(total),
      },
    },
  });
}

interface CreateVisitBody {
  ip?: string;
  userAgent?: string;
  referer?: string;
  path?: string;
}

export async function POST(request: NextRequest) {
  try {
    let body: CreateVisitBody = {};
    try {
      body = (await request.json()) as CreateVisitBody;
    } catch {
      body = {};
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip =
      body.ip ||
      forwarded?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent =
      body.userAgent || request.headers.get("user-agent") || "unknown";
    const referer = body.referer || request.headers.get("referer") || null;
    const path =
      body.path || new URL(request.url).pathname || null;

    await db.insert(visits).values({
      ip,
      userAgent,
      referer,
      path,
    });

    return NextResponse.json({
      statusCode: 200,
      message: "记录访问成功",
    });
  } catch (error: unknown) {
    console.error("记录访问失败:", error);
    return NextResponse.json(
      { statusMessage: error instanceof Error ? error.message : "记录访问失败" },
      { status: 500 },
    );
  }
}
