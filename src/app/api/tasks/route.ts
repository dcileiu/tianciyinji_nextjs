import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { tasks } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const isCompletedRaw = searchParams.get("isCompleted");
  const isCompleted =
    isCompletedRaw !== null ? isCompletedRaw === "true" : undefined;

  const offset = (page - 1) * PAGE_SIZE;

  const whereCondition =
    isCompleted !== undefined
      ? eq(tasks.isCompleted, isCompleted ? 1 : 0)
      : undefined;

  const [data, totalResult] = await Promise.all([
    whereCondition
      ? db
          .select()
          .from(tasks)
          .where(whereCondition)
          .orderBy(desc(tasks.createdAt))
          .limit(PAGE_SIZE)
          .offset(offset)
      : db
          .select()
          .from(tasks)
          .orderBy(desc(tasks.createdAt))
          .limit(PAGE_SIZE)
          .offset(offset),
    whereCondition
      ? db
          .select({ total: sql<number>`COUNT(*)`.as("total") })
          .from(tasks)
          .where(whereCondition)
      : db.select({ total: sql<number>`COUNT(*)`.as("total") }).from(tasks),
  ]);

  const total = totalResult[0]?.total || 0;

  return NextResponse.json({
    statusCode: 200,
    message: "获取任务列表成功",
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

interface CreateTaskBody {
  name: string;
  description?: string;
  dueDate?: string;
}

export async function POST(request: NextRequest) {
  const user = getAuthUser(request);
  if (!user) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  let body: CreateTaskBody;
  try {
    body = (await request.json()) as CreateTaskBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "创建任务失败",
      error: "无效请求体",
    });
  }

  if (!body.name) {
    return NextResponse.json({
      statusCode: 200,
      message: "创建任务失败",
      error: "name 为必填项",
    });
  }

  const result = await db.insert(tasks).values({
    name: body.name,
    description: body.description || null,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    isCompleted: 0,
  });

  const insertId = (result as unknown as { insertId: number }).insertId;

  return NextResponse.json({
    statusCode: 200,
    message: "创建任务成功",
    data: { id: insertId },
  });
}
