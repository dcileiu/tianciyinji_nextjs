import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "../../utils/auth";

export default defineEventHandler(async (event) => {
  const authUser = requireUser(event);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!user) {
    return {
      statusCode: 200,
      message: "获取用户信息失败",
      error: "用户不存在",
    };
  }

  const { password, token: userToken, ...userInfo } = user;

  return {
    statusCode: 200,
    data: {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      createdAt: userInfo.createdAt,
      updatedAt: userInfo.updatedAt,
    },
  };
});

