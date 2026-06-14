"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { sendEmail, welcomeEmail } from "@/server/email";
import { logSecurityEvent, rateLimit } from "@/server/security";

const WELCOME_CREDITS = 1000;

export type RegisterResult = { ok: true } | { ok: false; error: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  const ip = getClientIp(await headers());
  const rl = await rateLimit("register", ip);
  if (!rl.success) {
    await logSecurityEvent({ type: "RATE_LIMIT", scope: "register", identifier: ip });
    return { ok: false, error: "注册过于频繁，请稍后再试" };
  }

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "输入有误" };
  }

  const { name, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { ok: false, error: "该邮箱已被注册" };
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hash, credits: WELCOME_CREDITS },
  });

  const tpl = welcomeEmail(name);
  void sendEmail({ to: email, subject: tpl.subject, html: tpl.html });

  return { ok: true };
}
