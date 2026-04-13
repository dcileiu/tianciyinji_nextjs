import { db } from "../../db/client";
import { advertisements } from "../../db/schema";
import { requireUser } from "../../utils/auth";
import { eq } from "drizzle-orm";

interface CreateAdvertisementBody {
  title: string;
  imageUrl: string;
  position: string;
  order: number;
  isVisible: boolean;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const body = (await readBody(event)) as CreateAdvertisementBody;

  if (!body?.title || !body?.imageUrl || !body?.position) {
    return {
      statusCode: 200,
      message: "创建失败",
      error: "title、imageUrl 和 position 为必填项",
    };
  }

  try {
    const startTime =
      body.startTime ? new Date(body.startTime) : new Date();
    const endTime =
      body.endTime ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const result = await db.insert(advertisements).values({
      title: body.title,
      imageUrl: body.imageUrl,
      position: body.position,
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
      description: body.description ?? null,
      link: body.link ?? null,
      startTime,
      endTime: new Date(endTime),
    });

    const insertId = (result as any).insertId as number | undefined;
    let created: any = {
      title: body.title,
      imageUrl: body.imageUrl,
      position: body.position,
      order: body.order ?? 0,
      isVisible: body.isVisible ?? true,
      description: body.description ?? null,
      link: body.link ?? null,
      startTime,
      endTime: new Date(endTime),
    };

    if (insertId) {
      const [row] = await db
        .select()
        .from(advertisements)
        .where(eq(advertisements.id, insertId))
        .limit(1);
      if (row) created = row;
    }

    return {
      statusCode: 200,
      data: created,
    };
  } catch (error) {
    console.error("创建广告失败:", error);
    return {
      statusCode: 200,
      message: "创建失败",
      error: "系统错误",
    };
  }
});

