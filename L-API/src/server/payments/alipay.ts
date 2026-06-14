import "server-only";
import { AlipaySdk } from "alipay-sdk";
import { env } from "@/lib/env";

let sdk: AlipaySdk | null = null;

function pem(value: string): string {
  return value.replace(/\\n/g, "\n");
}

export function isAlipayEnabled(): boolean {
  return Boolean(env.ALIPAY_APP_ID && env.ALIPAY_PRIVATE_KEY && env.ALIPAY_PUBLIC_KEY);
}

function getAlipay(): AlipaySdk {
  if (!sdk) {
    sdk = new AlipaySdk({
      appId: env.ALIPAY_APP_ID as string,
      privateKey: pem(env.ALIPAY_PRIVATE_KEY as string),
      alipayPublicKey: pem(env.ALIPAY_PUBLIC_KEY as string),
      keyType: "PKCS8",
      signType: "RSA2",
      ...(env.ALIPAY_GATEWAY ? { gateway: env.ALIPAY_GATEWAY } : {}),
    });
  }
  return sdk;
}

/** 电脑网站支付：返回需要浏览器跳转的支付链接。 */
export function createAlipayPagePay(opts: {
  outTradeNo: string;
  amountYuan: string;
  subject: string;
  notifyUrl: string;
  returnUrl: string;
}): string {
  return getAlipay().pageExecute("alipay.trade.page.pay", "GET", {
    notify_url: opts.notifyUrl,
    return_url: opts.returnUrl,
    bizContent: {
      out_trade_no: opts.outTradeNo,
      total_amount: opts.amountYuan,
      subject: opts.subject,
      product_code: "FAST_INSTANT_TRADE_PAY",
    },
  });
}

/** 异步通知验签。 */
export function verifyAlipayNotify(postData: Record<string, string>): boolean {
  try {
    return getAlipay().checkNotifySign(postData);
  } catch {
    return false;
  }
}
