import { db } from "../../db/client";
import { banners } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireUser } from "../../utils/auth";

interface UpdateBannerBody {
  imageUrl?: string;
  isVisible?: boolean;
  order?: number;
  title?: string;
  description?: string;
  link?: string;
  startTime?: string;
  endTime?: string;
}

export default defineEventHandler(async (event) => {
  requireUser(event);

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);

  if (!id) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "横幅不存在",
    };
  }

  const body = (await readBody(event)) as UpdateBannerBody;

  const [current] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);

  if (!current) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "横幅不存在",
    };
  }

  const updatePayload: any = { ...body };
  if (body.startTime) updatePayload.startTime = new Date(body.startTime);
  if (body.endTime) updatePayload.endTime = new Date(body.endTime);

  await db
    .update(banners)
    .set(updatePayload)
    .where(eq(banners.id, id));

  const [updated] = await db
    .select()
    .from(banners)
    .where(eq(banners.id, id))
    .limit(1);

  return {
    statusCode: 200,
    data: updated,
  };
});

