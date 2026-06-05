import "server-only";
import { generateApiKey } from "@/lib/api-key";
import { prisma } from "@/lib/prisma";

export function listKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function countActiveKeys(userId: string) {
  return prisma.apiKey.count({ where: { userId, status: "ACTIVE" } });
}

export interface CreateKeyInput {
  name: string;
  scopes?: string[];
  expiresInDays?: number | null;
  dailyQuota?: number | null;
  rateLimitPerMin?: number | null;
}

/** 创建密钥并返回一次性明文。明文不会再次出现。 */
export async function createKey(userId: string, input: CreateKeyInput) {
  const { key, prefix, hash } = generateApiKey();
  const expiresAt =
    input.expiresInDays && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 86_400_000)
      : null;
  const record = await prisma.apiKey.create({
    data: {
      userId,
      name: input.name.trim() || "未命名密钥",
      prefix,
      hash,
      scopes: input.scopes && input.scopes.length > 0 ? input.scopes.join(",") : null,
      expiresAt,
      dailyQuota: input.dailyQuota && input.dailyQuota > 0 ? input.dailyQuota : null,
      rateLimitPerMin:
        input.rateLimitPerMin && input.rateLimitPerMin > 0 ? input.rateLimitPerMin : null,
    },
  });
  return { key, record };
}

export async function revokeKey(userId: string, keyId: string) {
  const result = await prisma.apiKey.updateMany({
    where: { id: keyId, userId },
    data: { status: "REVOKED" },
  });
  return result.count > 0;
}
