import { db } from "../../db/client";
import { banners } from "../../db/schema";
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
      error: "横幅不存在",
    };
  }

  try {
    // 先检查记录是否存在
    const existing = await db
      .select({ id: banners.id })
      .from(banners)
      .where(eq(banners.id, id))
      .limit(1);

    if (existing.length === 0) {
      return {
        statusCode: 200,
        message: "删除失败",
        error: "横幅不存在",
      };
    }

    // 执行删除
    await db.delete(banners).where(eq(banners.id, id));

    return {
      statusCode: 200,
      message: "删除成功",
      data: null,
    };
  } catch (error) {
    console.error("删除横幅失败:", error);
    return {
      statusCode: 200,
      message: "删除失败",
      error: "系统错误",
    };
  }
});

