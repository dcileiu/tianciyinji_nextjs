"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  ABUSE_POLICIES,
  type AbusePolicy,
  THROUGHPUT_POLICIES,
  type ThroughputPolicy,
} from "@/lib/rate-policies";
import { banEntity, logSecurityEvent, unban } from "@/server/security";
import { invalidatePolicyCache } from "@/server/security/settings";
import { requireAdmin } from "@/server/services/user";

export type AdminResult = { ok: true } | { ok: false; error: string };

function num(form: FormData, key: string): number {
  return Number(form.get(key));
}

function valid(...values: number[]): boolean {
  return values.every((v) => Number.isFinite(v) && v >= 1);
}

/** 超管保存限流/风控策略：写入 SecurityPolicy 覆盖默认值，并清缓存立即生效。 */
export async function updateSecurityPolicies(formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  try {
    const ops = [];

    for (const key of Object.keys(THROUGHPUT_POLICIES) as ThroughputPolicy[]) {
      const enabled = formData.get(`t_${key}_enabled`) === "on";
      const limit = num(formData, `t_${key}_limit`);
      const windowSec = num(formData, `t_${key}_window`);
      if (!valid(limit, windowSec)) {
        return { ok: false, error: `「${key}」的数值不合法` };
      }
      const windowMs = Math.round(windowSec * 1000);
      ops.push(
        prisma.securityPolicy.upsert({
          where: { key },
          create: { key, kind: "throughput", enabled, limit, windowMs },
          update: { enabled, limit, windowMs },
        }),
      );
    }

    for (const key of Object.keys(ABUSE_POLICIES) as AbusePolicy[]) {
      const enabled = formData.get(`a_${key}_enabled`) === "on";
      const threshold = num(formData, `a_${key}_threshold`);
      const windowSec = num(formData, `a_${key}_window`);
      const banMin = num(formData, `a_${key}_ban`);
      if (!valid(threshold, windowSec, banMin)) {
        return { ok: false, error: `「${key}」的数值不合法` };
      }
      ops.push(
        prisma.securityPolicy.upsert({
          where: { key },
          create: {
            key,
            kind: "abuse",
            enabled,
            threshold,
            windowMs: Math.round(windowSec * 1000),
            banMs: Math.round(banMin * 60_000),
          },
          update: {
            enabled,
            threshold,
            windowMs: Math.round(windowSec * 1000),
            banMs: Math.round(banMin * 60_000),
          },
        }),
      );
    }

    await prisma.$transaction(ops);
    invalidatePolicyCache();
    await logSecurityEvent({
      type: "POLICY",
      scope: "admin",
      identifier: admin.email ?? admin.id,
      userId: admin.id,
      detail: "更新了限流/风控策略",
    });
    revalidatePath("/admin/security");
    revalidatePath("/dashboard/security");
    return { ok: true };
  } catch {
    return { ok: false, error: "保存失败，请稍后再试" };
  }
}

const banSchema = z.object({
  scope: z.enum(["ip", "apiKey", "user", "login"]),
  identifier: z.string().trim().min(1, "请填写要封禁的标识"),
  minutes: z.coerce.number().min(1).max(525600),
});

export async function manualBan(formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = banSchema.safeParse({
    scope: formData.get("scope"),
    identifier: formData.get("identifier"),
    minutes: formData.get("minutes"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "参数有误" };
  }
  const { scope, identifier, minutes } = parsed.data;
  await banEntity(scope, identifier, minutes * 60_000);
  await logSecurityEvent({
    type: "BAN",
    scope,
    identifier,
    userId: admin.id,
    detail: `管理员 ${admin.email} 手动封禁 ${minutes} 分钟`,
  });
  revalidatePath("/admin/security");
  return { ok: true };
}

const unbanSchema = z.object({
  scope: z.enum(["ip", "apiKey", "user", "login"]),
  identifier: z.string().trim().min(1, "请填写要解封的标识"),
});

export async function manualUnban(formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = unbanSchema.safeParse({
    scope: formData.get("scope"),
    identifier: formData.get("identifier"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "参数有误" };
  }
  const { scope, identifier } = parsed.data;
  await unban(scope, identifier);
  await logSecurityEvent({
    type: "UNBAN",
    scope,
    identifier,
    userId: admin.id,
    detail: `管理员 ${admin.email} 手动解封`,
  });
  revalidatePath("/admin/security");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 用户管理
// ---------------------------------------------------------------------------

const creditsSchema = z.object({
  userId: z.string().min(1),
  delta: z.coerce
    .number()
    .int()
    .refine((v) => v !== 0, "调整额不能为 0"),
});

export async function adjustUserCredits(formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = creditsSchema.safeParse({
    userId: formData.get("userId"),
    delta: formData.get("delta"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "参数有误" };
  }
  const { userId, delta } = parsed.data;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } });
    if (!user) return { ok: false, error: "用户不存在" };
    if (user.credits + delta < 0) return { ok: false, error: "调整后积分不能为负" };
    await prisma.user.update({ where: { id: userId }, data: { credits: { increment: delta } } });
    await logSecurityEvent({
      type: "ADMIN",
      scope: "admin",
      identifier: admin.email ?? admin.id,
      userId: admin.id,
      detail: `调整用户 ${userId} 积分 ${delta > 0 ? "+" : ""}${delta}`,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "操作失败，请稍后再试" };
  }
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN"]),
});

export async function setUserRole(formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = roleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, error: "参数有误" };
  const { userId, role } = parsed.data;
  if (userId === admin.id && role !== "ADMIN") {
    return { ok: false, error: "不能取消自己的管理员权限" };
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await logSecurityEvent({
      type: "ADMIN",
      scope: "admin",
      identifier: admin.email ?? admin.id,
      userId: admin.id,
      detail: `设置用户 ${userId} 角色为 ${role}`,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { ok: false, error: "操作失败，请稍后再试" };
  }
}

// ---------------------------------------------------------------------------
// API 管理
// ---------------------------------------------------------------------------

const apiSchema = z.object({
  apiId: z.string().min(1),
  pricePerCall: z.coerce.number().int().min(0).max(100000),
  status: z.enum(["ACTIVE", "BETA", "DEPRECATED"]),
  featured: z.boolean(),
  summary: z.string().trim().min(1, "简介不能为空").max(500),
});

export async function updateApi(formData: FormData): Promise<AdminResult> {
  const admin = await requireAdmin();
  const parsed = apiSchema.safeParse({
    apiId: formData.get("apiId"),
    pricePerCall: formData.get("pricePerCall"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    summary: formData.get("summary"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "参数有误" };
  }
  const { apiId, ...data } = parsed.data;
  try {
    await prisma.api.update({ where: { id: apiId }, data });
    await logSecurityEvent({
      type: "ADMIN",
      scope: "admin",
      identifier: admin.email ?? admin.id,
      userId: admin.id,
      detail: `更新接口 ${apiId}`,
    });
    revalidatePath("/admin/apis");
    revalidatePath("/apis");
    return { ok: true };
  } catch {
    return { ok: false, error: "操作失败，请稍后再试" };
  }
}
