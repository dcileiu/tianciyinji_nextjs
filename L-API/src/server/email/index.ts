import "server-only";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

export { receiptEmail, welcomeEmail } from "@/server/email/templates";

export function isEmailEnabled(): boolean {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

/** 发送邮件（Resend）。未配置时记录日志并跳过，永不抛出。 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!isEmailEnabled()) {
    logger.info("email skipped (not configured)", { to: opts.to, subject: opts.subject });
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) {
      logger.warn("email send failed", { status: res.status });
      return false;
    }
    return true;
  } catch (err) {
    logger.warn("email send error", { error: String(err) });
    return false;
  }
}
