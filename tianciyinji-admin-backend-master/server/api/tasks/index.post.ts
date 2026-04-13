import { db } from "../../db/client";
import { tasks } from "../../db/schema";
import { requireUser } from "../../utils/auth";

interface CreateTaskBody {
  name: string;
  description?: string;
  dueDate?: string;
}

export default defineEventHandler(async (event) => {
  requireUser(event); // 需要登录

  const body = await readBody<CreateTaskBody>(event);

  if (!body.name) {
    return {
      statusCode: 200,
      message: "创建任务失败",
      error: "name 为必填项",
    };
  }

  const [task] = await db
    .insert(tasks)
    .values({
      name: body.name,
      description: body.description || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      isCompleted: 0,
    })
    .$returningId();

  return {
    statusCode: 200,
    message: "创建任务成功",
    data: task,
  };
});
