import "server-only";
import Redis from "ioredis";
import { env, isProd } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * 限流存储抽象。默认内存实现（单实例适用）；
 * 配置 UPSTASH_REDIS_REST_* 后自动切换为 Redis（多实例/Serverless 共享计数）。
 */
export interface RateStore {
  /** 固定窗口自增，返回当前计数与窗口剩余毫秒。 */
  hit(key: string, windowMs: number): Promise<{ count: number; resetMs: number }>;
  /** 设置封禁标记。 */
  block(key: string, ttlMs: number): Promise<void>;
  /** 解除封禁。 */
  unblock(key: string): Promise<void>;
  /** 是否处于封禁中。 */
  isBlocked(key: string): Promise<boolean>;
}

class MemoryRateStore implements RateStore {
  private counters = new Map<string, { count: number; expires: number }>();
  private blocks = new Map<string, number>();
  private sweepAt = 0;

  private sweep(now: number) {
    if (now < this.sweepAt) return;
    this.sweepAt = now + 60_000;
    for (const [k, v] of this.counters) if (v.expires <= now) this.counters.delete(k);
    for (const [k, v] of this.blocks) if (v <= now) this.blocks.delete(k);
  }

  async hit(key: string, windowMs: number) {
    const now = Date.now();
    this.sweep(now);
    const entry = this.counters.get(key);
    if (!entry || entry.expires <= now) {
      this.counters.set(key, { count: 1, expires: now + windowMs });
      return { count: 1, resetMs: windowMs };
    }
    entry.count += 1;
    return { count: entry.count, resetMs: entry.expires - now };
  }

  async block(key: string, ttlMs: number) {
    this.blocks.set(key, Date.now() + ttlMs);
  }

  async unblock(key: string) {
    this.blocks.delete(key);
  }

  async isBlocked(key: string) {
    const expires = this.blocks.get(key);
    if (!expires) return false;
    if (expires <= Date.now()) {
      this.blocks.delete(key);
      return false;
    }
    return true;
  }
}

type PipelineResult = { result: unknown }[];

class UpstashRateStore implements RateStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  private async pipeline(commands: (string | number)[][]): Promise<PipelineResult> {
    const res = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash error ${res.status}`);
    return (await res.json()) as PipelineResult;
  }

  async hit(key: string, windowMs: number) {
    const r = await this.pipeline([
      ["INCR", key],
      ["PEXPIRE", key, windowMs, "NX"],
      ["PTTL", key],
    ]);
    const count = Number((r[0]?.result as number) ?? 0);
    let ttl = Number((r[2]?.result as number) ?? windowMs);
    if (ttl < 0) ttl = windowMs;
    return { count, resetMs: ttl };
  }

  async block(key: string, ttlMs: number) {
    await this.pipeline([["SET", key, "1", "PX", ttlMs]]);
  }

  async unblock(key: string) {
    await this.pipeline([["DEL", key]]);
  }

  async isBlocked(key: string) {
    const r = await this.pipeline([["GET", key]]);
    return r[0]?.result != null;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __lapiRateStore: RateStore | undefined;
}

export function getRateStore(): RateStore {
  if (globalThis.__lapiRateStore) return globalThis.__lapiRateStore;
  const store =
    env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? new UpstashRateStore(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN)
      : new MemoryRateStore();
  globalThis.__lapiRateStore = store;
  return store;
}

export function rateStoreKind(): "redis" | "memory" {
  return env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? "redis" : "memory";
}
