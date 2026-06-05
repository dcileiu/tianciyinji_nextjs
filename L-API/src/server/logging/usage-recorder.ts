import "server-only";
import { startOfUtcDay } from "@/lib/day";
import { captureError } from "@/lib/observability";
import { prisma } from "@/lib/prisma";

export interface UsageEntry {
  userId: string;
  apiId: string | null;
  apiKeyId: string | null;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  creditsCost: number;
  createdAt: Date;
}

const FLUSH_SIZE = 50;
const FLUSH_DELAY_MS = 2000;
// 空字符串作为「无对应接口」的哨兵，避免 NULL 在唯一索引中被视为不同行。
const NO_API = "";

type RecorderState = {
  buffer: UsageEntry[];
  timer: ReturnType<typeof setTimeout> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __lapiUsageRecorder: RecorderState | undefined;
}

function state(): RecorderState {
  globalThis.__lapiUsageRecorder ??= { buffer: [], timer: null };
  return globalThis.__lapiUsageRecorder;
}

/** 非阻塞地记录一次调用：写入内存缓冲，按量/按时批量落库。 */
export function recordUsage(entry: UsageEntry): void {
  const s = state();
  s.buffer.push(entry);
  if (s.buffer.length >= FLUSH_SIZE) {
    void flushUsage();
    return;
  }
  s.timer ??= setTimeout(() => void flushUsage(), FLUSH_DELAY_MS);
}

/** 立即把缓冲写入数据库（批量日志 + 日汇总 + 热度/最近使用）。 */
export async function flushUsage(): Promise<void> {
  const s = state();
  if (s.timer) {
    clearTimeout(s.timer);
    s.timer = null;
  }
  if (s.buffer.length === 0) return;

  const batch = s.buffer.splice(0, s.buffer.length);

  try {
    await prisma.requestLog.createMany({
      data: batch.map((e) => ({
        userId: e.userId,
        apiId: e.apiId,
        apiKeyId: e.apiKeyId,
        endpoint: e.endpoint,
        statusCode: e.statusCode,
        latencyMs: e.latencyMs,
        creditsCost: e.creditsCost,
        createdAt: e.createdAt,
      })),
    });

    // 日维度增量汇总
    const rollups = new Map<
      string,
      {
        date: Date;
        userId: string;
        apiId: string;
        requests: number;
        errors: number;
        creditsCost: number;
        latencySumMs: number;
      }
    >();
    const popularity = new Map<string, number>();
    const usedKeys = new Map<string, Date>();

    for (const e of batch) {
      const date = startOfUtcDay(e.createdAt);
      const apiId = e.apiId ?? NO_API;
      const key = `${date.toISOString()}|${e.userId}|${apiId}`;
      const agg = rollups.get(key) ?? {
        date,
        userId: e.userId,
        apiId,
        requests: 0,
        errors: 0,
        creditsCost: 0,
        latencySumMs: 0,
      };
      agg.requests += 1;
      if (e.statusCode >= 400) agg.errors += 1;
      agg.creditsCost += e.creditsCost;
      agg.latencySumMs += e.latencyMs;
      rollups.set(key, agg);

      if (e.apiId && e.statusCode < 400) {
        popularity.set(e.apiId, (popularity.get(e.apiId) ?? 0) + 1);
      }
      if (e.apiKeyId) {
        const prev = usedKeys.get(e.apiKeyId);
        if (!prev || e.createdAt > prev) usedKeys.set(e.apiKeyId, e.createdAt);
      }
    }

    await Promise.all([
      ...[...rollups.values()].map((r) =>
        prisma.usageDaily.upsert({
          where: { date_userId_apiId: { date: r.date, userId: r.userId, apiId: r.apiId } },
          create: {
            date: r.date,
            userId: r.userId,
            apiId: r.apiId,
            requests: r.requests,
            errors: r.errors,
            creditsCost: r.creditsCost,
            latencySumMs: r.latencySumMs,
          },
          update: {
            requests: { increment: r.requests },
            errors: { increment: r.errors },
            creditsCost: { increment: r.creditsCost },
            latencySumMs: { increment: r.latencySumMs },
          },
        }),
      ),
      ...[...popularity.entries()].map(([apiId, inc]) =>
        prisma.api.updateMany({ where: { id: apiId }, data: { popularity: { increment: inc } } }),
      ),
      ...[...usedKeys.entries()].map(([apiKeyId, at]) =>
        prisma.apiKey.updateMany({ where: { id: apiKeyId }, data: { lastUsedAt: at } }),
      ),
    ]);
  } catch (err) {
    captureError(err, { scope: "usage-recorder", batchSize: batch.length });
  }
}
