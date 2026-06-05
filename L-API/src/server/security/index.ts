import "server-only";
import { prisma } from "@/lib/prisma";
import type { AbusePolicy, ThroughputPolicy } from "@/lib/rate-policies";
import { getAbuse, getThroughput } from "@/server/security/settings";
import { getRateStore } from "@/server/security/store";

export { getClientIp } from "@/lib/ip";
export { rateStoreKind } from "@/server/security/store";

export interface RateResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSec: number;
  retryAfterSec: number;
}

/** 吞吐限流：返回是否放行及限流头所需信息（策略由后台动态配置）。 */
export async function rateLimit(name: ThroughputPolicy, id: string): Promise<RateResult> {
  const policy = await getThroughput(name);
  if (!policy.enabled) {
    return {
      success: true,
      limit: policy.limit,
      remaining: policy.limit,
      resetSec: Math.ceil((Date.now() + policy.windowMs) / 1000),
      retryAfterSec: 0,
    };
  }
  const { count, resetMs } = await getRateStore().hit(`rl:${name}:${id}`, policy.windowMs);
  return {
    success: count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    resetSec: Math.ceil((Date.now() + resetMs) / 1000),
    retryAfterSec: Math.max(1, Math.ceil(resetMs / 1000)),
  };
}

/** 自定义阈值限流（用于密钥级覆盖：每分钟上限、独立每日配额等）。 */
export async function rateLimitCustom(
  id: string,
  limit: number,
  windowMs: number,
): Promise<RateResult> {
  const { count, resetMs } = await getRateStore().hit(`rlc:${id}`, windowMs);
  return {
    success: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    resetSec: Math.ceil((Date.now() + resetMs) / 1000),
    retryAfterSec: Math.max(1, Math.ceil(resetMs / 1000)),
  };
}

/** 记录一次失败；若达到阈值则封禁并返回 true（策略由后台动态配置）。 */
export async function registerFailure(scope: AbusePolicy, id: string): Promise<boolean> {
  const policy = await getAbuse(scope);
  if (!policy.enabled) return false;
  const { count } = await getRateStore().hit(`bf:${scope}:${id}`, policy.windowMs);
  if (count >= policy.threshold) {
    await getRateStore().block(`ban:${scope}:${id}`, policy.banMs);
    return true;
  }
  return false;
}

export async function isBanned(scope: string, id: string): Promise<boolean> {
  return getRateStore().isBlocked(`ban:${scope}:${id}`);
}

export async function banEntity(scope: string, id: string, ttlMs: number): Promise<void> {
  await getRateStore().block(`ban:${scope}:${id}`, ttlMs);
}

export async function unban(scope: string, id: string): Promise<void> {
  await getRateStore().unblock(`ban:${scope}:${id}`);
}

/** 接口调用失败时记录，错误过多自动临时封禁密钥。 */
export async function recordApiError(keyId: string, userId: string): Promise<void> {
  const banned = await registerFailure("apiKey", keyId);
  if (banned) {
    await logSecurityEvent({
      type: "BAN",
      scope: "key",
      identifier: keyId,
      userId,
      detail: "接口错误次数过多，密钥被临时封禁",
    });
  }
}

export function rateHeaders(result: RateResult, includeRetry = false): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetSec),
  };
  if (includeRetry) headers["Retry-After"] = String(result.retryAfterSec);
  return headers;
}

export type SecurityEventType =
  | "RATE_LIMIT"
  | "QUOTA"
  | "BAN"
  | "LOGIN_LOCK"
  | "ABUSE"
  | "UNBAN"
  | "POLICY"
  | "ADMIN";

/** 审计日志（尽力而为，不阻断主流程）。 */
export async function logSecurityEvent(input: {
  type: SecurityEventType;
  scope: string;
  identifier: string;
  detail?: string;
  userId?: string | null;
}): Promise<void> {
  try {
    await prisma.securityEvent.create({
      data: {
        type: input.type,
        scope: input.scope,
        identifier: input.identifier,
        detail: input.detail,
        userId: input.userId ?? null,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[security] failed to log event:", err);
    }
  }
}
