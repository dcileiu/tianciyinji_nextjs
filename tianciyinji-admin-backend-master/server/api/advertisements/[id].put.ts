import { db } from "../../db/client";
import { advertisements } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getRouterParam } from "h3";
import { requireUser } from "../../utils/auth";

interface UpdateAdvertisementBody {
  title?: string;
  imageUrl?: string;
  position?: string;
  order?: number;
  isVisible?: boolean;
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
      error: "广告不存在",
    };
  }

  const body = (await readBody(event)) as UpdateAdvertisementBody;

  const [current] = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.id, id))
    .limit(1);

  if (!current) {
    return {
      statusCode: 200,
      message: "更新失败",
      error: "广告不存在",
    };
  }

  const updatePayload: any = { ...body };
  if (body.startTime) updatePayload.startTime = new Date(body.startTime);
  if (body.endTime) updatePayload.endTime = new Date(body.endTime);

  await db
    .update(advertisements)
    .set(updatePayload)
    .where(eq(advertisements.id, id));

  const [updated] = await db
    .select()
    .from(advertisements)
    .where(eq(advertisements.id, id))
    .limit(1);

  return {
    statusCode: 200,
    data: updated,
  };
});

