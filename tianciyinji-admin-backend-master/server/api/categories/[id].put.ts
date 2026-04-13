import { db } from "../../db/client";
import { categories } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireUser } from "../../utils/auth";

interface UpdateCategoryBody {
  name?: string;
  key?: string;
  order?: number;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!id) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "分类不存在",
    };
  }

  const body = (await readBody(event)) as UpdateCategoryBody;

  const [current] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  if (!current) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "分类不存在",
    };
  }

  await db
    .update(categories)
    .set(body)
    .where(eq(categories.id, id));

  const [updated] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return {
    statusCode: 200,
    data: updated,
  };
});

