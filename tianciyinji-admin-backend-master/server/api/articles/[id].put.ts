import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireUser } from "../../utils/auth";

interface UpdateArticleBody {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  coverImage?: string;
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
      error: "文章不存在",
    };
  }

  const body = (await readBody(event)) as UpdateArticleBody;

  const [existing] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  if (!existing) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "文章不存在",
    };
  }

  const updatePayload: any = { ...body };
  if (body.tags) {
    updatePayload.tags = body.tags.join(",");
  }

  await db
    .update(articles)
    .set(updatePayload)
    .where(eq(articles.id, id));

  const [updated] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  return {
    statusCode: 200,
    data: {
      ...updated,
      tags: updated.tags
        ? (updated.tags as string).split(",").filter(Boolean)
        : [],
    },
  };
});

