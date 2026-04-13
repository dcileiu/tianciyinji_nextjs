import { db } from "../../db/client";
import { categories } from "../../db/schema";
import { requireUser } from "../../utils/auth";
import { eq } from "drizzle-orm";

interface CreateCategoryBody {
  name: string;
  key: string;
  order: number;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const body = (await readBody(event)) as CreateCategoryBody;

  if (!body?.name || !body?.key) {
    return {
      statusCode: 200,
      message: "创建失败",
      error: "分类名称和 key 为必填项",
    };
  }

  try {
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.key, body.key))
      .limit(1);

    if (existing) {
      return {
        statusCode: 200,
        message: "创建失败",
        error: "分类已存在",
      };
    }

    const result = await db.insert(categories).values({
      name: body.name,
      key: body.key,
      order: body.order ?? 0,
    });

    const insertId = (result as any).insertId as number | undefined;
    let created: any = {
      name: body.name,
      key: body.key,
      order: body.order ?? 0,
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(categories)
        .where(eq(categories.id, insertId))
        .limit(1);
      if (row) created = row;
    }

    return {
      statusCode: 200,
      data: created,
    };
  } catch (error) {
    console.error("创建分类失败:", error);
    return {
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    };
  }
});

