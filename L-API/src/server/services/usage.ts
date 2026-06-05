import "server-only";
import { formatMonthDay } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export interface OverviewStats {
  weekRequests: number;
  todayRequests: number;
  activeKeys: number;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getOverviewStats(userId: string): Promise<OverviewStats> {
  const [weekRequests, todayRequests, activeKeys] = await Promise.all([
    prisma.requestLog.count({ where: { userId, createdAt: { gte: daysAgo(7) } } }),
    prisma.requestLog.count({ where: { userId, createdAt: { gte: startOfToday() } } }),
    prisma.apiKey.count({ where: { userId, status: "ACTIVE" } }),
  ]);
  return { weekRequests, todayRequests, activeKeys };
}

export interface TrendPoint {
  date: string;
  requests: number;
}

export async function getRequestTrend(userId: string, days = 7): Promise<TrendPoint[]> {
  const start = daysAgo(days - 1);
  const logs = await prisma.requestLog.findMany({
    where: { userId, createdAt: { gte: start } },
    select: { createdAt: true },
  });

  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    buckets.set(formatMonthDay(d), 0);
  }
  for (const log of logs) {
    const key = formatMonthDay(log.createdAt);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()].map(([date, requests]) => ({ date, requests }));
}

export interface TopApi {
  slug: string;
  name: string;
  requests: number;
}

export async function getTopApis(userId: string, limit = 5): Promise<TopApi[]> {
  const grouped = await prisma.requestLog.groupBy({
    by: ["apiId"],
    where: { userId, apiId: { not: null }, createdAt: { gte: daysAgo(7) } },
    _count: { _all: true },
    orderBy: { _count: { apiId: "desc" } },
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
      return { slug: api.slug, name: api.name, requests: g._count._all };
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
