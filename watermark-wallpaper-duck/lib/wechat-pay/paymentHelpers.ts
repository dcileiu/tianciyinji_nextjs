export function getAppName() {
  return process.env.WECHAT_PAY_APP_NAME || "去水印壁纸鸭";
}

export function formatFenAsYuan(amountFen: number) {
  const fen = Number(amountFen);
  if (!Number.isFinite(fen)) return "0.00";
  return (fen / 100).toFixed(2);
}

export function normalizeClientIp(rawIp: string) {
  const ip = String(rawIp || "").trim();
  if (!ip || ip === "::1") return "127.0.0.1";
  if (ip.startsWith("::ffff:")) return ip.slice("::ffff:".length);
  return ip;
}

export function buildNativeOrderPayload({
  appid,
  mchid,
  notifyUrl,
  amountFen,
  outTradeNo,
  description,
}: {
  appid: string;
  mchid: string;
  notifyUrl: string;
  amountFen: number;
  outTradeNo: string;
  description: string;
}) {
  return {
    appid,
    mchid,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: amountFen,
      currency: "CNY",
    },
  };
}

export function buildH5OrderPayload({
  appid,
  mchid,
  notifyUrl,
  amountFen,
  clientIp,
  appUrl,
  outTradeNo,
  description,
}: {
  appid: string;
  mchid: string;
  notifyUrl: string;
  amountFen: number;
  clientIp: string;
  appUrl: string;
  outTradeNo: string;
  description: string;
}) {
  return {
    appid,
    mchid,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    amount: {
      total: amountFen,
      currency: "CNY",
    },
    scene_info: {
      payer_client_ip: normalizeClientIp(clientIp),
      h5_info: {
        type: "Wap",
        app_name: getAppName(),
        app_url: appUrl,
      },
    },
  };
}

export function appendH5RedirectUrl({
  h5Url,
  redirectUrl,
}: {
  h5Url: string;
  redirectUrl: string;
}) {
  if (!h5Url || !redirectUrl) return h5Url || "";
  const url = new URL(h5Url);
  url.searchParams.set("redirect_url", redirectUrl);
  return url.toString();
}
