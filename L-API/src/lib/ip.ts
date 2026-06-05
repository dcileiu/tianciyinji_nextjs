/** 从请求头解析客户端 IP（兼容常见反代/CDN 头）。 */
export function getClientIp(headers: Headers | null | undefined): string {
  if (!headers) return "0.0.0.0";
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "0.0.0.0";
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    "0.0.0.0"
  );
}
