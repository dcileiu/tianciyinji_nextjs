import "server-only";
import WxPay from "wechatpay-node-v3";
import { env } from "@/lib/env";

let pay: WxPay | null = null;

function pem(value: string): string {
  return value.replace(/\\n/g, "\n");
}

export function isWechatEnabled(): boolean {
  return Boolean(
    env.WECHAT_APP_ID &&
      env.WECHAT_MCH_ID &&
      env.WECHAT_API_V3_KEY &&
      env.WECHAT_PRIVATE_KEY &&
      env.WECHAT_CERT &&
      env.WECHAT_CERT_SERIAL,
  );
}

function getWechat(): WxPay {
  if (!pay) {
    pay = new WxPay({
      appid: env.WECHAT_APP_ID as string,
      mchid: env.WECHAT_MCH_ID as string,
      serial_no: env.WECHAT_CERT_SERIAL as string,
      publicKey: Buffer.from(pem(env.WECHAT_CERT as string)),
      privateKey: Buffer.from(pem(env.WECHAT_PRIVATE_KEY as string)),
      key: env.WECHAT_API_V3_KEY as string,
    });
  }
  return pay;
}

/** Native 扫码支付：返回 code_url（用于生成二维码）。 */
export async function createWechatNative(opts: {
  outTradeNo: string;
  amountFen: number;
  description: string;
  notifyUrl: string;
}): Promise<string> {
  const res = await getWechat().transactions_native({
    appid: env.WECHAT_APP_ID as string,
    mchid: env.WECHAT_MCH_ID as string,
    description: opts.description,
    out_trade_no: opts.outTradeNo,
    notify_url: opts.notifyUrl,
    amount: { total: opts.amountFen },
  });
  const codeUrl = res?.data?.code_url as string | undefined;
  if (!codeUrl)
    throw new Error(`微信下单失败: ${res?.status ?? ""} ${JSON.stringify(res?.error ?? "")}`);
  return codeUrl;
}

export interface WechatNotifyResult {
  out_trade_no: string;
  trade_state: string;
  transaction_id: string;
}

/** 异步通知验签 + 解密。失败返回 null。 */
export async function verifyWechatNotify(
  headers: {
    timestamp: string;
    nonce: string;
    signature: string;
    serial: string;
  },
  rawBody: string,
): Promise<WechatNotifyResult | null> {
  try {
    const wx = getWechat();
    const ok = await wx.verifySign({
      timestamp: headers.timestamp,
      nonce: headers.nonce,
      serial: headers.serial,
      signature: headers.signature,
      body: rawBody,
    });
    if (!ok) return null;
    const json = JSON.parse(rawBody) as {
      resource: { ciphertext: string; associated_data: string; nonce: string };
    };
    const r = json.resource;
    return wx.decipher_gcm<WechatNotifyResult>(r.ciphertext, r.associated_data, r.nonce);
  } catch {
    return null;
  }
}
