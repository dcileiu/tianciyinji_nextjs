import { db } from "../../db/client";
import { categories } from "../../db/schema";
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
      error: "分类不存在",
    };
  }

  try {
    // 先检查记录是否存在
    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (existing.length === 0) {
      return {
        statusCode: 200,
        message: "删除失败",
        error: "分类不存在",
      };
    }

    // 执行删除
    await db.delete(categories).where(eq(categories.id, id));

    return {
      statusCode: 200,
      message: "删除成功",
      data: null,
    };
  } catch (error) {
    console.error("删除分类失败:", error);
    return {
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    };
  }
});

