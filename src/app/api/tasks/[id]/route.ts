import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { tasks } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

interface UpdateTaskBody {
  name?: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: string;
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

  let body: UpdateTaskBody;
  try {
    body = (await request.json()) as UpdateTaskBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "更新任务失败",
      error: "无效请求体",
    });
  }

  if (Number.isNaN(id)) {
    return NextResponse.json({
      statusCode: 200,
      message: "更新任务失败",
      error: "无效的任务ID",
    });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined)
    updateData.description = body.description || null;
  if (body.isCompleted !== undefined)
    updateData.isCompleted = body.isCompleted ? 1 : 0;
  if (body.dueDate !== undefined)
    updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  await db.update(tasks).set(updateData).where(eq(tasks.id, id));

  return NextResponse.json({
    statusCode: 200,
    message: "更新任务成功",
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

  if (Number.isNaN(id)) {
    return NextResponse.json({
      statusCode: 200,
      message: "删除任务失败",
      error: "无效的任务ID",
    });
  }

  await db.delete(tasks).where(eq(tasks.id, id));

  return NextResponse.json({
    statusCode: 200,
    message: "删除任务成功",
  });
}
