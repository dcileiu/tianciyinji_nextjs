import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getClientIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { isBanned, logSecurityEvent, registerFailure } from "@/server/security";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials provider 必须使用 JWT 会话策略
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      authorize: async (raw, request) => {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = getClientIp((request as Request | undefined)?.headers ?? null);
        const lockId = `${email}:${ip}`;

        // 防爆破：锁定期间直接拒绝
        if (await isBanned("login", lockId)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) {
          await registerFailure("login", lockId);
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          const locked = await registerFailure("login", lockId);
          if (locked) {
            await logSecurityEvent({
              type: "LOGIN_LOCK",
              scope: "login",
              identifier: email,
              userId: user.id,
              detail: "登录失败次数过多，已临时锁定",
            });
          }
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as Role;
      return session;
    },
  },
});
