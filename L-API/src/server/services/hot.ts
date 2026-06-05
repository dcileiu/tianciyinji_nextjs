import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type HotItemWithApi = Prisma.HotItemGetPayload<{
  include: { api: { include: { category: true } } };
}>;

export async function getTodayHot(): Promise<HotItemWithApi[]> {
  const latest = await prisma.hotItem.findFirst({ orderBy: { date: "desc" } });
  if (!latest) return [];

  return prisma.hotItem.findMany({
    where: { date: latest.date },
    include: { api: { include: { category: true } } },
    orderBy: { rank: "asc" },
  });
}

export function getSubscription(userId: string) {
  return prisma.hotSubscription.findUnique({ where: { userId } });
}

export async function toggleSubscription(userId: string): Promise<boolean> {
  const existing = await prisma.hotSubscription.findUnique({ where: { userId } });
  if (existing) {
    await prisma.hotSubscription.delete({ where: { userId } });
    return false;
  }
  await prisma.hotSubscription.create({ data: { userId } });
  return true;
}
