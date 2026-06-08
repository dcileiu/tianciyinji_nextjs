/**
 * 统一解析请求参数：合并 URL query 与请求体（POST/PUT/PATCH）。
 * 支持 application/json 与 application/x-www-form-urlencoded；body 同名键覆盖 query。
 * 解析失败时按「无 body」处理，不抛出。
 */
export async function readRequestParams(req: Request): Promise<URLSearchParams> {
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);

  const method = req.method.toUpperCase();
  if (method !== "POST" && method !== "PUT" && method !== "PATCH") return params;

  const contentType = req.headers.get("content-type")?.toLowerCase() ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body: unknown = await req.json();
      if (body && typeof body === "object" && !Array.isArray(body)) {
        for (const [key, value] of Object.entries(body)) {
          if (value === null || value === undefined) continue;
          params.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
        }
      }
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      for (const [key, value] of new URLSearchParams(text)) params.set(key, value);
    }
  } catch {
    // 忽略 body 解析错误，回退为仅 query 参数
  }

  return params;
}
