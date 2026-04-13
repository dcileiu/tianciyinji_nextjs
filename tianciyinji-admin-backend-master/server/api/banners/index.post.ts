import { db } from "../../db/client";
import { banners } from "../../db/schema";
import { requireUser } from "../../utils/auth";
import { eq } from "drizzle-orm";

interface CreateBannerBody {
  imageUrl: string;
  isVisible: boolean;
  order: number;
  title?: string;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const body = (await readBody(event)) as CreateBannerBody;

  if (!body?.imageUrl) {
    return {
      statusCode: 200,
      message: "创建失败",
      error: "imageUrl 为必填项",
    };
  }

  try {
    const result = await db.insert(banners).values({
      imageUrl: body.imageUrl,
      isVisible: body.isVisible ?? true,
      order: body.order ?? 0,
      title: body.title ?? null,
      description: body.description ?? null,
      link: body.link ?? null,
      startTime: body.startTime ? new Date(body.startTime) : null,
      endTime: body.endTime ? new Date(body.endTime) : null,
    });

    const insertId = (result as any).insertId as number | undefined;
    let created: any = {
      imageUrl: body.imageUrl,
      isVisible: body.isVisible ?? true,
      order: body.order ?? 0,
      title: body.title ?? null,
      description: body.description ?? null,
      link: body.link ?? null,
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(banners)
        .where(eq(banners.id, insertId))
        .limit(1);
      if (row) created = row;
    }

    return {
      statusCode: 200,
      data: created,
    };
  } catch (error) {
    console.error("创建横幅失败:", error);
    return {
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    };
  }
});

