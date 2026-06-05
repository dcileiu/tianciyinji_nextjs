import { logger } from "@/lib/logger";

/**
 * 统一错误上报入口。当前落到结构化日志；
 * 接入 Sentry 时只需在此调用 `Sentry.captureException(error, { extra: context })`。
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) };
  logger.error(normalized.message || "unhandled error", { error: normalized, ...context });
}
