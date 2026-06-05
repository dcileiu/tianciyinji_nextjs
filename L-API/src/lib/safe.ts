/**
 * 在数据库不可用（如 CI 构建无 DB）时优雅降级，避免页面渲染整体失败。
 * 仅用于公开页面的非关键数据读取。
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[safe] data fetch failed, using fallback:", err);
    }
    return fallback;
  }
}
