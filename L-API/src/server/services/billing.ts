import "server-only";
import { prisma } from "@/lib/prisma";

export function listPackages() {
  return prisma.creditPackage.findMany({ orderBy: { order: "asc" } });
}

export function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { package: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export type PurchaseResult = { ok: true; credits: number } | { ok: false; error: string };

/** 模拟购买：创建已支付订单并即时增加积分（不接真实支付）。 */
export async function purchasePackage(userId: string, packageId: string): Promise<PurchaseResult> {
  const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
  if (!pkg) return { ok: false, error: "套餐不存在" };

  const grant = pkg.credits + pkg.bonus;

  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId,
        packageId: pkg.id,
        credits: grant,
        amountCents: pkg.priceCents,
        status: "PAID",
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: { increment: grant } },
    }),
  ]);

  return { ok: true, credits: grant };
}
