import "server-only";
import { isAlipayEnabled } from "@/server/payments/alipay";
import { isWechatEnabled } from "@/server/payments/wechat";

export type PaymentMethod = "alipay" | "wechat";

export function enabledPaymentMethods(): PaymentMethod[] {
  const methods: PaymentMethod[] = [];
  if (isAlipayEnabled()) methods.push("alipay");
  if (isWechatEnabled()) methods.push("wechat");
  return methods;
}

export function isPaymentEnabled(): boolean {
  return enabledPaymentMethods().length > 0;
}
