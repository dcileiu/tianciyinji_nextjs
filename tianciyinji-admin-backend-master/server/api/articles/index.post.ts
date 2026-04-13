import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { requireUser } from "../../utils/auth";
import type { H3Event } from "h3";
import { eq } from "drizzle-orm";

interface CreateArticleBody {
  title: string;
  content?: string;
  category: string;
  tags: string[];
  isPublished?: boolean;
  coverImage?: string;
  order?: number;
}

function normalizeArticlePayload(body: CreateArticleBody) {
  return {
    title: body.title,
    content: body.content ?? "",
    category: body.category,
    tags: (body.tags ?? []).join(","),
    isPublished: body.isPublished ?? true,
    coverImage:
      body.coverImage ??
      "http://p1.qhimg.com/t01b4d0943444706854.jpg",
    order: body.order ?? 0,
  };
}

export default defineEventHandler(async (event: H3Event) => {
  // 需要登录
  requireUser(event);

  const body = (await readBody(event)) as CreateArticleBody;

  if (!body?.title || !body?.category) {
    return {
      statusCode: 200,
      message: "创建失败",
      error: "标题和分类为必填项",
    };
  }

  try {
    const payload = normalizeArticlePayload(body);
    const result = await db.insert(articles).values(payload);
    const insertId = (result as any).insertId as number | undefined;

    let created = payload as any;
    if (insertId) {
      const [row] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, insertId))
        .limit(1);
      if (row) {
        created = row;
      }
    }

    return {
      statusCode: 200,
      data: {
        ...created,
        tags: created.tags
          ? (created.tags as string).split(",").filter(Boolean)
          : [],
      },
    };
  } catch (error) {
    console.error("创建文章失败:", error);
    return {
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    };
  }
});

