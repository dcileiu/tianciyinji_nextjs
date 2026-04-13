/** 与 articleStore 一致：未配置 NEXT_PUBLIC_API_URL 时用相对路径走同源 API */
export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  return base ? `${base}${path}` : path;
}
