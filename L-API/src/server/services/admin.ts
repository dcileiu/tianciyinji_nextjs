import "server-only";
import { prisma } from "@/lib/prisma";

export function listAllSecurityEvents(take = 80) {
  return prisma.securityEvent.findMany({ orderBy: { createdAt: "desc" }, take });
}

export async function getSecurityEventStats(): Promise<{ total: number; last24h: number }> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [total, last24h] = await Promise.all([
    prisma.securityEvent.count(),
    prisma.securityEvent.count({ where: { createdAt: { gte: since } } }),
  ]);
  return { total, last24h };
}

export async function getAdminOverview() {
  const [users, apis, paidOrders, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.api.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: "PAID" } }),
  ]);
  return { users, apis, paidOrders, revenueCents: revenue._sum.amountCents ?? 0 };
}

// ---- 用户管理 ----

export async function listUsers(page = 1, q?: string, pageSize = 20) {
  const where = q ? { OR: [{ email: { contains: q } }, { name: { contains: q } }] } : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { apiKeys: true, requestLogs: true, orders: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)), page };
}

// ---- API 管理 ----

export function listAdminApis() {
  return prisma.api.findMany({
    orderBy: [{ category: { order: "asc" } }, { popularity: "desc" }],
    include: { category: { select: { name: true } } },
  });
}

// ---- 订单管理 ----

export async function listAdminOrders(page = 1, pageSize = 20) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { email: true, name: true } },
        package: { select: { name: true } },
      },
    }),
    prisma.order.count(),
  ]);
  return { items, total, totalPages: Math.max(1, Math.ceil(total / pageSize)), page };
}

export async function getOrderStats() {
  const [paidCount, agg] = await Promise.all([
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({
      _sum: { amountCents: true, credits: true },
      where: { status: "PAID" },
    }),
  ]);
  return {
    paidCount,
    revenueCents: agg._sum.amountCents ?? 0,
    creditsSold: agg._sum.credits ?? 0,
  };
}
