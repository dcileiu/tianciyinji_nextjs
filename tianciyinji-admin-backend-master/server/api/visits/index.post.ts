import { db } from "../../db/client";
import { visits } from "../../db/schema";

interface CreateVisitBody {
  ip?: string;
  userAgent?: string;
  referer?: string;
  path?: string;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<CreateVisitBody>(event);

    // 从请求头获取信息
    const ip =
      body.ip ||
      getHeader(event, "x-forwarded-for")?.split(",")[0] ||
      getHeader(event, "x-real-ip") ||
      "unknown";
    const userAgent = body.userAgent || getHeader(event, "user-agent") || "unknown";
    const referer = body.referer || getHeader(event, "referer") || null;
    const path = body.path || getRequestURL(event).pathname || null;

    await db.insert(visits).values({
      ip,
      userAgent,
      referer,
      path,
    });

    return {
      statusCode: 200,
      message: "记录访问成功",
    };
  } catch (error: any) {
    console.error("记录访问失败:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "记录访问失败",
    });
  }
});
