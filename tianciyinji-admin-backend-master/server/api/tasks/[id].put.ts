import { db } from "../../db/client";
import { tasks } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "../../utils/auth";

interface UpdateTaskBody {
  name?: string;
  description?: string;
  isCompleted?: boolean;
  dueDate?: string;
}

export default defineEventHandler(async (event) => {
  requireUser(event); // 需要登录

  const id = Number(getRouterParam(event, "id"));
  const body = await readBody<UpdateTaskBody>(event);

  if (isNaN(id)) {
    return {
      statusCode: 200,
      message: "更新任务失败",
      error: "无效的任务ID",
    };
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined)
    updateData.description = body.description || null;
  if (body.isCompleted !== undefined)
    updateData.isCompleted = body.isCompleted ? 1 : 0;
  if (body.dueDate !== undefined)
    updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;

  await db.update(tasks).set(updateData).where(eq(tasks.id, id));

  return {
    statusCode: 200,
    message: "更新任务成功",
  };
});
