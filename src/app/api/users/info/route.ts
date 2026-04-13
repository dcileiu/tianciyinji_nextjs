import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { getAuthUser } from "@/server/auth/jwt";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const authUser = getAuthUser(request);
  if (!authUser) {
    return NextResponse.json({ statusMessage: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  if (!user) {
    return NextResponse.json({
      statusCode: 200,
      message: "获取用户信息失败",
      error: "用户不存在",
    });
  }

  const { password: _omitPwd, token: _omitTok, ...userInfo } = user;
  void _omitPwd;
  void _omitTok;

  return NextResponse.json({
    statusCode: 200,
    data: {
      id: userInfo.id,
      username: userInfo.username,
      email: userInfo.email,
      createdAt: userInfo.createdAt,
      updatedAt: userInfo.updatedAt,
    },
  });
}
