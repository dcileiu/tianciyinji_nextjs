import { db } from "../../db/client";
import { tags } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "../../utils/auth";

interface CreateTagBody {
  title: string;
  key: string;
  order: number;
  isVisible: boolean;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const body = (await readBody(event)) as CreateTagBody;

  if (!body?.title || !body?.key) {
    return {
      statusCode: 200,
      message: "创建失败",
      error: "标签名称和 key 为必填项",
    };
  }

  try {
    const [existing] = await db
      .select()
      .from(tags)
      .where(eq(tags.key, body.key))
      .limit(1);

    if (existing) {
      return {
        statusCode: 200,
        message: "创建失败",
        error: "标签已存在",
      };
    }

    const result = await db.insert(tags).values({
      title: body.title,
      key: body.key,
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
    });

    const insertId = (result as any).insertId as number | undefined;
    let created: any = {
      title: body.title,
      key: body.key,
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(tags)
        .where(eq(tags.id, insertId))
        .limit(1);
      if (row) created = row;
    }

    return {
      statusCode: 200,
      data: created,
    };
  } catch (error) {
    console.error("创建标签失败:", error);
    return {
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    };
  }
});

