import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface LoginBody {
  username?: string;
  password?: string;
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as LoginBody;

  if (!body?.username || !body?.password) {
    return {
      statusCode: 200,
      message: "登录失败",
      error: "账号或密码错误",
    };
  }

  try {
    // 查询用户 - 只选择登录所需字段，避免旧表中缺少列导致查询失败
    console.log("查询用户:", body.username);
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
      return {
        statusCode: 200,
        message: "登录失败",
        error: "账号或密码错误",
      };
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return {
        statusCode: 200,
        message: "登录失败",
        error: "账号或密码错误",
      };
    }

    // 生成 JWT token
    const config = useRuntimeConfig();
    const secret = (config.JWT_SECRET as string) || "nuxt-admin-dev-secret";
    const expiresIn = (config.JWT_EXPIRES_IN as string) || "7d";

    const payload = { username: user.username, sub: user.id };
    const token = jwt.sign(payload, secret, {
      expiresIn,
    });

    // 更新最后登录时间和当前 token（如果表中没有这些列，不影响登录流程）
    try {
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          token,
        })
        .where(eq(users.id, user.id));
    } catch (updateError) {
      console.error("更新用户登录信息失败（忽略，不影响登录）:", updateError);
    }

    return {
      statusCode: 200,
      message: "登录成功",
      data: {
        access_token: token,
      },
    };
  } catch (error: any) {
    console.error("登录失败 - 详细错误:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      // Drizzle 会把底层 MySQL 错误放在 cause 里
      cause: error?.cause,
    });
    
    // 返回更详细的错误信息（开发环境）
    const errorMessage = process.env.NODE_ENV === "development" 
      ? `系统错误: ${error?.message || String(error)}`
      : "系统错误，请重试";
    
    return {
      statusCode: 200,
      message: "登录失败",
      error: errorMessage,
    };
  }
});

