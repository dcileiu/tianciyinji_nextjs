import "server-only";
import type { CreditPackage } from "@prisma/client";
import QRCode from "qrcode";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { receiptEmail, sendEmail } from "@/server/email";
import { createAlipayPagePay } from "@/server/payments/alipay";
import { enabledPaymentMethods, type PaymentMethod } from "@/server/payments";
import { createWechatNative } from "@/server/payments/wechat";

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

export type CheckoutResult =
  | { ok: true; kind: "credited"; credits: number }
  | { ok: true; kind: "redirect"; url: string }
  | { ok: true; kind: "qr"; qrDataUrl: string; orderId: string }
  | { ok: false; error: string };

/** 发起购买：免费包/未接支付时模拟即时到账；否则按所选渠道创建待支付订单。 */
export async function startCheckout(
  userId: string,
  packageId: string,
  method?: PaymentMethod,
): Promise<CheckoutResult> {
  const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
  if (!pkg) return { ok: false, error: "套餐不存在" };

  // 免费包，或未配置/未选择有效支付渠道 → 模拟到账（保证开发可用）
  if (pkg.priceCents === 0 || !method || !enabledPaymentMethods().includes(method)) {
    const credits = await grantSimulated(userId, pkg);
    return { ok: true, kind: "credited", credits };
  }

  const grant = pkg.credits + pkg.bonus;
  const order = await prisma.order.create({
    data: {
      userId,
      packageId: pkg.id,
      credits: grant,
      amountCents: pkg.priceCents,
      status: "PENDING",
      provider: method,
    },
  });
  const base = env.NEXT_PUBLIC_APP_URL;

  if (method === "alipay") {
    const url = createAlipayPagePay({
      outTradeNo: order.id,
      amountYuan: (pkg.priceCents / 100).toFixed(2),
      subject: pkg.name,
      notifyUrl: `${base}/api/webhooks/alipay`,
      returnUrl: `${base}/dashboard/billing?paid=1`,
    });
    return { ok: true, kind: "redirect", url };
  }

  // wechat（Native 扫码）
  try {
    const codeUrl = await createWechatNative({
      outTradeNo: order.id,
      amountFen: pkg.priceCents,
      description: pkg.name,
      notifyUrl: `${base}/api/webhooks/wechat`,
    });
    const qrDataUrl = await QRCode.toDataURL(codeUrl);
    return { ok: true, kind: "qr", qrDataUrl, orderId: order.id };
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    return { ok: false, error: "微信下单失败，请稍后再试" };
  }
}

/** 模拟到账：直接创建已支付订单并发放积分。 */
async function grantSimulated(userId: string, pkg: CreditPackage): Promise<number> {
  const grant = pkg.credits + pkg.bonus;
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        packageId: pkg.id,
        credits: grant,
        amountCents: pkg.priceCents,
        status: "PAID",
        provider: "manual",
      },
    });
    await tx.user.update({ where: { id: userId }, data: { credits: { increment: grant } } });
    return created;
  });
  void sendReceipt(order.id);
  return grant;
}

/** webhook 到账：仅 PENDING→PAID 一次，幂等发放积分。返回是否本次新到账。 */
export async function grantOrder(orderId: string, externalId?: string): Promise<boolean> {
  const granted = await prisma.$transaction(async (tx) => {
    const upd = await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "PAID", externalId },
    });
    if (upd.count === 0) return false;
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return false;
    await tx.user.update({
      where: { id: order.userId },
      data: { credits: { increment: order.credits } },
    });
    return true;
  });
  if (granted) void sendReceipt(orderId);
  return granted;
}

export async function getOrderStatus(userId: string, orderId: string): Promise<string | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { status: true },
  });
  return order?.status ?? null;
}

async function sendReceipt(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, package: true },
  });
  if (!order?.user.email) return;
  const tpl = receiptEmail({
    name: order.user.name ?? undefined,
    packageName: order.package?.name ?? "资源包",
    credits: order.credits,
    amountCents: order.amountCents,
  });
  await sendEmail({ to: order.user.email, subject: tpl.subject, html: tpl.html });
}
