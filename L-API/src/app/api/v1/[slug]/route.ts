import { NextResponse } from "next/server";
import { hashApiKey } from "@/lib/api-key";
import { captureError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";
import { ApiInputError, runApi } from "@/server/api-runtime";
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
  "Access-Control-Allow-Headers": "x-api-key, content-type",
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

  // 2) 密钥鉴权
  const key = req.headers.get("x-api-key") ?? url.searchParams.get("key");
  if (!key) {
    return respond(401, {
      success: false,
      error: "缺少 API 密钥（请在 x-api-key 请求头或 ?key= 中提供）",
    });
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: { hash: hashApiKey(key), status: "ACTIVE" },
    include: { user: true },
  });
  if (!apiKey) {
    return respond(401, { success: false, error: "无效或已吊销的 API 密钥" });
  }

  // 2b) 过期校验
  if (apiKey.expiresAt && apiKey.expiresAt.getTime() < Date.now()) {
    return respond(401, { success: false, error: "API 密钥已过期" });
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

  // 5) 计费校验
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

  // 7) 执行 + 计费（积分扣减同步保证一致），日志异步批量写入
  const startedAt = Date.now();
  try {
    const data = await runApi(slug, url.searchParams);
    const latencyMs = Date.now() - startedAt;

    await prisma.user.update({
      where: { id: apiKey.userId },
      data: { credits: { decrement: cost } },
    });
    log({
      userId: apiKey.userId,
      apiId: api.id,
      apiKeyId: apiKey.id,
      endpoint: api.path,
      statusCode: 200,
      latencyMs,
      creditsCost: cost,
    });

    return respond(
      200,
      {
        success: true,
        data,
        meta: { creditsCost: cost, creditsRemaining: apiKey.user.credits - cost, latencyMs },
      },
      rateHeaders(keyRl),
    );
  } catch (err) {
    const latencyMs = Date.now() - startedAt;
    const isInput = err instanceof ApiInputError;
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
    return respond(
      isInput ? 400 : 500,
      { success: false, error: isInput ? err.message : "接口执行失败" },
      rateHeaders(keyRl),
    );
  }
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
