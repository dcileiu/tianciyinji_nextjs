function firstHeaderValue(value: string | null) {
  return String(value || "");
}

export function getRequestBaseUrl(request: Request) {
  const origin = firstHeaderValue(request.headers.get("origin"));
  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"))
    .split(",")[0]
    ?.trim();
  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ||
    firstHeaderValue(request.headers.get("host"));
  const proto =
    forwardedProto ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export function getClientIp(request: Request) {
  const forwardedFor = firstHeaderValue(request.headers.get("x-forwarded-for"));
  const firstForwardedIp = forwardedFor.split(",")[0]?.trim();
  const realIp = firstHeaderValue(request.headers.get("x-real-ip"));
  return firstForwardedIp || realIp || "127.0.0.1";
}

export function getH5AppUrl(request: Request) {
  if (process.env.WECHAT_PAY_H5_APP_URL) {
    return process.env.WECHAT_PAY_H5_APP_URL;
  }
  return getRequestBaseUrl(request);
}

export function getH5NotifyUrl(request: Request) {
  if (process.env.WECHAT_PAY_H5_NOTIFY_URL) {
    return process.env.WECHAT_PAY_H5_NOTIFY_URL;
  }
  return `${getRequestBaseUrl(request)}/api/pay/h5/notify`;
}

export function getNativeNotifyUrl(request: Request) {
  if (process.env.WECHAT_PAY_NATIVE_NOTIFY_URL) {
    return process.env.WECHAT_PAY_NATIVE_NOTIFY_URL;
  }
  return `${getRequestBaseUrl(request)}/api/pay/native/notify`;
}

export function getH5RedirectUrl(request: Request, outTradeNo: string) {
  const baseUrl = getRequestBaseUrl(request);
  return `${baseUrl}/api-pricing/pay/h5/result?outTradeNo=${encodeURIComponent(outTradeNo)}`;
}
