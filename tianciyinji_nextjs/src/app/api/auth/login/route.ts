import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { getJwtSecret } from "@/server/auth/jwt";

export const runtime = "nodejs";

interface LoginBody {
  username?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return NextResponse.json({
      statusCode: 200,
      message: "登录失败",
      error: "账号或密码错误",
    });
  }

  if (!body?.username || !body?.password) {
    return NextResponse.json({
      statusCode: 200,
      message: "登录失败",
      error: "账号或密码错误",
    });
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        password: users.password,
      })
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1);

    if (!user) {
      return NextResponse.json({
        statusCode: 200,
        message: "登录失败",
        error: "账号或密码错误",
      });
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        statusCode: 200,
        message: "登录失败",
        error: "账号或密码错误",
      });
    }

    const secret = getJwtSecret();
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"],
    };
    const token = jwt.sign(
      { username: user.username, sub: user.id },
      secret,
      signOptions,
    );

    try {
      await db
        .update(users)
        .set({ lastLoginAt: new Date(), token })
        .where(eq(users.id, user.id));
    } catch (updateError) {
      console.error("更新用户登录信息失败（忽略）:", updateError);
    }

    return NextResponse.json({
      statusCode: 200,
      message: "登录成功",
      data: { access_token: token },
    });
  } catch (error: unknown) {
    console.error("登录失败:", error);
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `系统错误: ${error instanceof Error ? error.message : String(error)}`
        : "系统错误，请重试";
    return NextResponse.json({
      statusCode: 200,
      message: "登录失败",
      error: errorMessage,
    });
  }
}
