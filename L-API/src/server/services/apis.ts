import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ApiWithCategory = Prisma.ApiGetPayload<{ include: { category: true } }>;

export interface ApiFilter {
  q?: string;
  category?: string;
  status?: "ACTIVE" | "BETA" | "DEPRECATED";
}

export function listCategories() {
  return prisma.apiCategory.findMany({ orderBy: { order: "asc" } });
}

export async function listApis(filter: ApiFilter = {}): Promise<ApiWithCategory[]> {
  const where: Prisma.ApiWhereInput = {};

  if (filter.q) {
    where.OR = [
      { name: { contains: filter.q } },
      { summary: { contains: filter.q } },
      { slug: { contains: filter.q } },
    ];
  }
  if (filter.category) {
    where.category = { slug: filter.category };
  }
  if (filter.status) {
    where.status = filter.status;
  }

  return prisma.api.findMany({
    where,
    include: { category: true },
    orderBy: [{ featured: "desc" }, { popularity: "desc" }],
  });
}

export function listFeaturedApis(limit = 6) {
  return prisma.api.findMany({
    where: { featured: true },
    include: { category: true },
    orderBy: { popularity: "desc" },
    take: limit,
  });
}

export function getApiBySlug(slug: string) {
  return prisma.api.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export interface PlatformStats {
  totalApis: number;
  totalCalls: number;
  totalCategories: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [totalApis, totalCategories, popularity, logCount] = await Promise.all([
    prisma.api.count(),
    prisma.apiCategory.count(),
    prisma.api.aggregate({ _sum: { popularity: true } }),
    prisma.requestLog.count(),
  ]);

  return {
    totalApis,
    totalCategories,
    totalCalls: (popularity._sum.popularity ?? 0) * 10 + logCount,
  };
}
