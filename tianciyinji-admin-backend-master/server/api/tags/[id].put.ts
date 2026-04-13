import { db } from "../../db/client";
import { tags } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireUser } from "../../utils/auth";

interface UpdateTagBody {
  title?: string;
  key?: string;
  order?: number;
  isVisible?: boolean;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!id) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "标签不存在",
    };
  }

  const body = (await readBody(event)) as UpdateTagBody;

  try {
    if (body.key) {
      const [existing] = await db
        .select()
        .from(tags)
        .where(eq(tags.key, body.key))
        .limit(1);

      if (existing && existing.id !== id) {
        return {
          statusCode: 200,
          message: "更新失败",
          error: "标签已存在",
        };
      }
    }

    const [current] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (!current) {
      return {
        statusCode: 200,
        message: "更新失败",
        error: "标签不存在",
      };
    }

    await db
      .update(tags)
      .set(body)
      .where(eq(tags.id, id));

    const [updated] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    return {
      statusCode: 200,
      data: updated,
    };
  } catch (error) {
    console.error("更新标签失败:", error);
    return {
      statusCode: 200,
      message: "更新失败",
      error: "系统错误",
    };
  }
});

