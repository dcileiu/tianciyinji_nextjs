import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  requireUser(event);

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!id) {
    return {
      statusCode: 200,
      message: "删除失败",
      error: "文章不存在",
    };
  }

  try {
    // 执行删除
    const result = await db.delete(articles).where(eq(articles.id, id));

    // Drizzle ORM 在 MySQL 中返回 ResultSetHeader，包含 affectedRows
    const affectedRows = (result as any)?.affectedRows ?? 0;

    if (affectedRows === 0) {
      return {
        statusCode: 200,
        message: "删除失败",
        error: "文章不存在",
      };
    }

    return {
      statusCode: 200,
      message: "删除成功",
      data: null,
    };
  } catch (error) {
    console.error("删除文章失败:", error);
    return {
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    };
  }
});

