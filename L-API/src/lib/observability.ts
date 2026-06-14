import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export interface SentryDsn {
  envelopeUrl: string;
  publicKey: string;
  host: string;
  projectId: string;
}

/** 解析 Sentry DSN（`https://<publicKey>@<host>/<projectId>`）。纯函数，便于测试。 */
export function parseSentryDsn(dsn: string): SentryDsn | null {
  try {
    const u = new URL(dsn);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\/+/, "");
    if (!publicKey || !projectId) return null;
    return {
      envelopeUrl: `${u.protocol}//${u.host}/api/${projectId}/envelope/`,
      publicKey,
      host: u.host,
      projectId,
    };
  } catch {
    return null;
  }
}

function normalize(error: unknown) {
  return error instanceof Error
    ? { name: error.name, message: error.message, stack: error.stack }
    : { name: "Error", message: String(error), stack: undefined as string | undefined };
}

async function sendToSentry(
  normalized: ReturnType<typeof normalize>,
  context?: Record<string, unknown>,
): Promise<void> {
  try {
    const dsn = env.SENTRY_DSN ? parseSentryDsn(env.SENTRY_DSN) : null;
    if (!dsn) return;
    const eventId = globalThis.crypto.randomUUID().replace(/-/g, "");
    const sentAt = new Date().toISOString();
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "node",
      level: "error",
      environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
      logger: "l-api",
      exception: {
        values: [{ type: normalized.name, value: normalized.message }],
      },
      extra: { ...context, stack: normalized.stack },
    };
    const body = [
      JSON.stringify({ event_id: eventId, sent_at: sentAt, dsn: env.SENTRY_DSN }),
      JSON.stringify({ type: "event" }),
      JSON.stringify(event),
    ].join("\n");
    await fetch(dsn.envelopeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${dsn.publicKey}, sentry_client=l-api/1.0`,
      },
      body,
    });
  } catch {
    // 上报失败不影响主流程
  }
}

/**
 * 统一错误上报入口：始终写结构化日志；配置 SENTRY_DSN 时额外异步上报到 Sentry。
 */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const normalized = normalize(error);
  logger.error(normalized.message || "unhandled error", { error: normalized, ...context });
  if (env.SENTRY_DSN) void sendToSentry(normalized, context);
}
