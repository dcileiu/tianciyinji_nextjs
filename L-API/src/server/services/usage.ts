import "server-only";
import { startOfUtcDay, utcDateKey, utcDaysAgo } from "@/lib/day";
import { formatMonthDay } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export interface OverviewStats {
  weekRequests: number;
  todayRequests: number;
  activeKeys: number;
}

// 概览/趋势/Top 走 UsageDaily 汇总表（避免扫全量日志）；明细列表仍读 RequestLog。
export async function getOverviewStats(userId: string): Promise<OverviewStats> {
  const today = startOfUtcDay();
  const [week, todayAgg, activeKeys] = await Promise.all([
    prisma.usageDaily.aggregate({
      _sum: { requests: true },
      where: { userId, date: { gte: utcDaysAgo(6) } },
    }),
    prisma.usageDaily.aggregate({
      _sum: { requests: true },
      where: { userId, date: { gte: today } },
    }),
    prisma.apiKey.count({ where: { userId, status: "ACTIVE" } }),
  ]);
  return {
    weekRequests: week._sum.requests ?? 0,
    todayRequests: todayAgg._sum.requests ?? 0,
    activeKeys,
  };
}

export interface TrendPoint {
  date: string;
  requests: number;
}

export async function getRequestTrend(userId: string, days = 7): Promise<TrendPoint[]> {
  const start = utcDaysAgo(days - 1);
  const rows = await prisma.usageDaily.groupBy({
    by: ["date"],
    where: { userId, date: { gte: start } },
    _sum: { requests: true },
  });

  const byDay = new Map<string, number>();
  for (const row of rows) byDay.set(utcDateKey(row.date), row._sum.requests ?? 0);

  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = utcDaysAgo(i);
    points.push({ date: formatMonthDay(d), requests: byDay.get(utcDateKey(d)) ?? 0 });
  }
  return points;
}

export interface TopApi {
  slug: string;
  name: string;
  requests: number;
}

export async function getTopApis(userId: string, limit = 5): Promise<TopApi[]> {
  const grouped = await prisma.usageDaily.groupBy({
    by: ["apiId"],
    where: { userId, apiId: { not: "" }, date: { gte: utcDaysAgo(6) } },
    _sum: { requests: true },
    orderBy: { _sum: { requests: "desc" } },
    take: limit,
  });

  const ids = grouped.map((g) => g.apiId).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return [];

  const apis = await prisma.api.findMany({
    where: { id: { in: ids } },
    select: { id: true, slug: true, name: true },
  });
  const apiById = new Map(apis.map((a) => [a.id, a]));

  return grouped
    .map((g) => {
      const api = g.apiId ? apiById.get(g.apiId) : undefined;
      if (!api) return null;
      return { slug: api.slug, name: api.name, requests: g._sum.requests ?? 0 };
    })
    .filter((x): x is TopApi => x !== null);
}

export interface LogPage {
  items: Awaited<ReturnType<typeof fetchLogs>>;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function fetchLogs(userId: string, skip: number, take: number) {
  return prisma.requestLog.findMany({
    where: { userId },
    include: { api: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

export async function listLogs(userId: string, page = 1, pageSize = 20): Promise<LogPage> {
  const safePage = Math.max(1, page);
  const [items, total] = await Promise.all([
    fetchLogs(userId, (safePage - 1) * pageSize, pageSize),
    prisma.requestLog.count({ where: { userId } }),
  ]);
  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
