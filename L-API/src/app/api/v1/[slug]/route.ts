import { NextResponse } from "next/server";
import { hashApiKey } from "@/lib/api-key";
import { captureError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { readRequestParams } from "@/lib/request-params";
import { ApiInputError, runApi } from "@/server/api-runtime";
import { completeIdempotent, lookupIdempotent, reserveIdempotent } from "@/server/idempotency";
import { recordUsage } from "@/server/logging/usage-recorder";
import {
  getClientIp,
  isBanned,
  logSecurityEvent,
  rateHeaders,
  rateLimit,
  rateLimitCustom,
  recordApiError,
} from "@/server/security";

export const dynamic = "force-dynamic";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "x-api-key, content-type, idempotency-key",
  "Access-Control-Max-Age": "86400",
};

function respond(status: number, body: unknown, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...CORS_HEADERS, ...headers } });
}

function log(entry: Omit<Parameters<typeof recordUsage>[0], "createdAt">) {
  recordUsage({ ...entry, createdAt: new Date() });
}

type RouteContext = { params: Promise<{ slug: string }> };

async function handle(req: Request, slug: string) {
  const url = new URL(req.url);
  const ip = getClientIp(req.headers);

  // 1) IP 级封禁与限流（拦截无密钥的洪泛）
  if (await isBanned("ip", ip)) {
    return respond(403, { success: false, error: "你的访问已被临时限制" });
  }
  const ipRl = await rateLimit("apiPerIp", ip);
  if (!ipRl.success) {
    await logSecurityEvent({ type: "RATE_LIMIT", scope: "ip", identifier: ip });
    return respond(
      429,
      { success: false, error: "请求过于频繁，请稍后再试" },
      rateHeaders(ipRl, true),
    );
  }

  // 2) 密钥鉴权（hash 唯一索引，等值命中）
  const key = req.headers.get("x-api-key") ?? url.searchParams.get("key");
  if (!key) {
    return respond(401, {
      success: false,
      error: "缺少 API 密钥（请在 x-api-key 请求头或 ?key= 中提供）",
    });
  }

  const apiKey = await prisma.apiKey.findUnique({
    where: { hash: hashApiKey(key) },
    include: { user: true },
  });
  if (!apiKey || apiKey.status !== "ACTIVE") {
    return respond(401, { success: false, error: "无效或已吊销的 API 密钥" });
  }

  // 2b) 过期校验
  if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
    return respond(401, { success: false, error: "API 密钥已过期" });
  }

  // 幂等键（可选）：尽早回放已完成结果，避免重复扣费与副作用
  const idemKey = req.headers.get("idempotency-key");
  const scopeKey = idemKey ? `${apiKey.id}:${idemKey}` : null;
  if (scopeKey) {
    const hit = await lookupIdempotent(scopeKey);
    if (hit.kind === "replay") {
      return respond(hit.statusCode, hit.body, { "Idempotent-Replayed": "true" });
    }
    if (hit.kind === "pending") {
      return respond(409, { success: false, error: "请求处理中，请勿重复提交" });
    }
  }

  // 3) 密钥级封禁与限流（支持密钥自定义每分钟上限）
  if (await isBanned("apiKey", apiKey.id)) {
    return respond(403, { success: false, error: "该密钥已被临时封禁，请稍后再试" });
  }
  const keyRl = apiKey.rateLimitPerMin
    ? await rateLimitCustom(`keymin:${apiKey.id}`, apiKey.rateLimitPerMin, 60_000)
    : await rateLimit("apiPerKey", apiKey.id);
  if (!keyRl.success) {
    await logSecurityEvent({
      type: "RATE_LIMIT",
      scope: "key",
      identifier: apiKey.id,
      userId: apiKey.userId,
    });
    return respond(
      429,
      { success: false, error: "密钥调用过于频繁，请稍后再试" },
      rateHeaders(keyRl, true),
    );
  }

  // 4) 接口校验
  const api = await prisma.api.findUnique({
    where: { slug },
    include: { category: { select: { slug: true } } },
  });
  if (!api || api.status === "DEPRECATED") {
    return respond(404, { success: false, error: "接口不存在或已下线" }, rateHeaders(keyRl));
  }

  // 4b) Scope 校验（密钥仅允许指定分类）
  const scopes = (apiKey.scopes ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (scopes.length > 0 && !scopes.includes(api.category.slug)) {
    log({
      userId: apiKey.userId,
      apiId: api.id,
      apiKeyId: apiKey.id,
      endpoint: api.path,
      statusCode: 403,
      latencyMs: 0,
      creditsCost: 0,
    });
    return respond(403, { success: false, error: "该密钥无权访问此接口分类" }, rateHeaders(keyRl));
  }

  // 5) 余额快速预检（最终以原子扣费为准）
  const cost = api.pricePerCall;
  if (apiKey.user.credits < cost) {
    log({
      userId: apiKey.userId,
      apiId: api.id,
      apiKeyId: apiKey.id,
      endpoint: api.path,
      statusCode: 402,
      latencyMs: 0,
      creditsCost: 0,
    });
    return respond(
      402,
      { success: false, error: "积分不足，请前往控制台购买资源包" },
      rateHeaders(keyRl),
    );
  }

  // 6) 配额：用户全局每日 + 密钥独立每日
  const quota = await rateLimit("dailyQuota", apiKey.userId);
  if (!quota.success) {
    await logSecurityEvent({
      type: "QUOTA",
      scope: "user",
      identifier: apiKey.userId,
      userId: apiKey.userId,
      detail: "已达每日调用上限",
    });
    return respond(
      429,
      { success: false, error: "已达今日调用上限，请明日再试或升级套餐" },
      rateHeaders(quota, true),
    );
  }
  if (apiKey.dailyQuota) {
    const keyQuota = await rateLimitCustom(`keyday:${apiKey.id}`, apiKey.dailyQuota, 86_400_000);
    if (!keyQuota.success) {
      await logSecurityEvent({
        type: "QUOTA",
        scope: "key",
        identifier: apiKey.id,
        userId: apiKey.userId,
        detail: "已达密钥每日配额",
      });
      return respond(
        429,
        { success: false, error: "该密钥已达今日配额上限" },
        rateHeaders(keyQuota, true),
      );
    }
  }

  // 幂等预留（扣费前）：并发下仅一个请求继续，其余回放/等待
  if (scopeKey) {
    const reserved = await reserveIdempotent(scopeKey);
    if (reserved.kind === "replay") {
      return respond(reserved.statusCode, reserved.body, { "Idempotent-Replayed": "true" });
    }
    if (reserved.kind === "pending") {
      return respond(409, { success: false, error: "请求处理中，请勿重复提交" });
    }
  }

  // 7) 原子扣费（条件更新，杜绝并发超扣）
  const charged = await prisma.user.updateMany({
    where: { id: apiKey.userId, credits: { gte: cost } },
    data: { credits: { decrement: cost } },
  });
  if (charged.count === 0) {
    log({
      userId: apiKey.userId,
      apiId: api.id,
      apiKeyId: apiKey.id,
      endpoint: api.path,
      statusCode: 402,
      latencyMs: 0,
      creditsCost: 0,
    });
    const payload = { success: false, error: "积分不足，请前往控制台购买资源包" };
    if (scopeKey) await completeIdempotent(scopeKey, 402, payload);
    return respond(402, payload, rateHeaders(keyRl));
  }

  // 8) 执行（失败则退款），日志异步批量写入
  const startedAt = Date.now();
  let status: number;
  let payload: unknown;
  try {
    const params = await readRequestParams(req);
    const data = await runApi(slug, params);
    const latencyMs = Date.now() - startedAt;
    log({
      userId: apiKey.userId,
      apiId: api.id,
      apiKeyId: apiKey.id,
      endpoint: api.path,
      statusCode: 200,
      latencyMs,
      creditsCost: cost,
    });
    status = 200;
    payload = {
      success: true,
      data,
      meta: {
        creditsCost: cost,
        creditsRemaining: Math.max(0, apiKey.user.credits - cost),
        latencyMs,
      },
    };
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const isInput = err instanceof ApiInputError;
    // 退款：执行失败不计费
    await prisma.user.update({
      where: { id: apiKey.userId },
      data: { credits: { increment: cost } },
    });
    log({
      userId: apiKey.userId,
      apiId: api.id,
      apiKeyId: apiKey.id,
      endpoint: api.path,
      statusCode: isInput ? 400 : 500,
      latencyMs,
      creditsCost: 0,
    });
    await recordApiError(apiKey.id, apiKey.userId);
    if (!isInput) captureError(err, { slug, apiId: api.id, userId: apiKey.userId });
    status = isInput ? 400 : 500;
    payload = { success: false, error: isInput ? err.message : "接口执行失败" };
  }

  if (scopeKey) await completeIdempotent(scopeKey, status, payload);
  return respond(status, payload, rateHeaders(keyRl));
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  return handle(req, slug);
}

export async function POST(req: Request, ctx: RouteContext) {
  const { slug } = await ctx.params;
  return handle(req, slug);
}
