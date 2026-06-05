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

/** 创建密钥并返回一次性明文。明文不会再次出现。 */
export async function createKey(userId: string, name: string) {
  const { key, prefix, hash } = generateApiKey();
  const record = await prisma.apiKey.create({
    data: { userId, name: name.trim() || "未命名密钥", prefix, hash },
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
