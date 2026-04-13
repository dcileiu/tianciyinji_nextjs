import { db } from "../../db/client";
import { tasks } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  requireUser(event); // 需要登录

  const id = Number(getRouterParam(event, "id"));

  if (isNaN(id)) {
    return {
      statusCode: 200,
      message: "删除任务失败",
      error: "无效的任务ID",
    };
  }

  await db.delete(tasks).where(eq(tasks.id, id));

  return {
    statusCode: 200,
    message: "删除任务成功",
  };
});
