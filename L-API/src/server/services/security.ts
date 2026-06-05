import "server-only";
import { prisma } from "@/lib/prisma";

export function listSecurityEvents(userId: string, take = 50) {
  return prisma.securityEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function countRecentSecurityEvents(userId: string): Promise<number> {
  return prisma.securityEvent.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
  });
}
