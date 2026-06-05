import "server-only";
import { prisma } from "@/lib/prisma";
import {
  ABUSE_POLICIES,
  type AbusePolicy,
  THROUGHPUT_POLICIES,
  type ThroughputPolicy,
} from "@/lib/rate-policies";

export type ThroughputConfig = { limit: number; windowMs: number; enabled: boolean };
export type AbuseConfig = { threshold: number; windowMs: number; banMs: number; enabled: boolean };

export type EffectivePolicies = {
  throughput: Record<ThroughputPolicy, ThroughputConfig>;
  abuse: Record<AbusePolicy, AbuseConfig>;
};

const CACHE_TTL_MS = 30_000;
let cache: { data: EffectivePolicies; at: number } | null = null;

function buildDefaults(): EffectivePolicies {
  const throughput = {} as Record<ThroughputPolicy, ThroughputConfig>;
  for (const key of Object.keys(THROUGHPUT_POLICIES) as ThroughputPolicy[]) {
    throughput[key] = { ...THROUGHPUT_POLICIES[key], enabled: true };
  }
  const abuse = {} as Record<AbusePolicy, AbuseConfig>;
  for (const key of Object.keys(ABUSE_POLICIES) as AbusePolicy[]) {
    abuse[key] = { ...ABUSE_POLICIES[key], enabled: true };
  }
  return { throughput, abuse };
}

/** 后台保存后调用，使限流立即读到新值（同实例）。其他实例由 TTL 兜底。 */
export function invalidatePolicyCache(): void {
  cache = null;
}

/** 读取「代码默认值 + 数据库覆盖」的生效策略；数据库不可用时回退默认值。 */
export async function loadPolicies(): Promise<EffectivePolicies> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  const data = buildDefaults();
  try {
    const rows = await prisma.securityPolicy.findMany();
    for (const row of rows) {
      if (row.kind === "throughput" && row.key in data.throughput) {
        const cfg = data.throughput[row.key as ThroughputPolicy];
        cfg.enabled = row.enabled;
        cfg.windowMs = row.windowMs;
        if (row.limit != null) cfg.limit = row.limit;
      } else if (row.kind === "abuse" && row.key in data.abuse) {
        const cfg = data.abuse[row.key as AbusePolicy];
        cfg.enabled = row.enabled;
        cfg.windowMs = row.windowMs;
        if (row.threshold != null) cfg.threshold = row.threshold;
        if (row.banMs != null) cfg.banMs = row.banMs;
      }
    }
    cache = { data, at: Date.now() };
    return data;
  } catch {
    // 数据库不可用：使用默认值且不写缓存。
    return data;
  }
}

export async function getThroughput(name: ThroughputPolicy): Promise<ThroughputConfig> {
  return (await loadPolicies()).throughput[name];
}

export async function getAbuse(name: AbusePolicy): Promise<AbuseConfig> {
  return (await loadPolicies()).abuse[name];
}
