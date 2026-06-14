import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const PENDING = 0;
// 占位预留超过此时长视为陈旧（处理进程可能已崩溃），允许回收重试。
const STALE_MS = 60_000;

export type IdemHit =
  | { kind: "replay"; statusCode: number; body: unknown }
  | { kind: "pending" }
  | { kind: "fresh" };

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 只读探测：命中已完成记录则回放；处理中则 pending；否则 fresh（可继续处理）。 */
export async function lookupIdempotent(scopeKey: string): Promise<IdemHit> {
  const existing = await prisma.idempotencyRecord.findUnique({ where: { scopeKey } });
  if (!existing) return { kind: "fresh" };
  if (existing.statusCode !== PENDING) {
    return { kind: "replay", statusCode: existing.statusCode, body: safeParse(existing.body) };
  }
  if (Date.now() - existing.createdAt.getTime() < STALE_MS) return { kind: "pending" };
  // 陈旧占位：回收以便重新处理
  await prisma.idempotencyRecord.deleteMany({ where: { scopeKey, statusCode: PENDING } });
  return { kind: "fresh" };
}

/** 预留占位（扣费前调用）。并发下仅一个请求拿到 fresh，其余得到 replay/pending。 */
export async function reserveIdempotent(scopeKey: string): Promise<IdemHit> {
  try {
    await prisma.idempotencyRecord.create({ data: { scopeKey, statusCode: PENDING, body: "" } });
    return { kind: "fresh" };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const again = await prisma.idempotencyRecord.findUnique({ where: { scopeKey } });
      if (again && again.statusCode !== PENDING) {
        return { kind: "replay", statusCode: again.statusCode, body: safeParse(again.body) };
      }
      return { kind: "pending" };
    }
    throw err;
  }
}

/** 写入最终结果，后续相同 key 的请求将回放该结果。 */
export async function completeIdempotent(
  scopeKey: string,
  statusCode: number,
  body: unknown,
): Promise<void> {
  await prisma.idempotencyRecord.updateMany({
    where: { scopeKey },
    data: { statusCode, body: JSON.stringify(body) },
  });
}
