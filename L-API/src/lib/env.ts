import { z } from "zod";

/**
 * 集中校验并导出环境变量。
 * 为保证在缺少 .env 的环境（如 CI 仅做 build）也能完成构建，这里对关键变量提供
 * 安全的开发默认值；生产环境请务必通过 .env 覆盖（尤其是 AUTH_SECRET 与 DATABASE_URL）。
 */
const schema = z.object({
  DATABASE_URL: z.string().min(1).default("mysql://lapi:lapi_pwd@localhost:3306/l_api"),
  AUTH_SECRET: z.string().min(1).default("dev-insecure-secret-change-me-0123456789abcdef"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // 可选：限流共享存储。自建用 REDIS_URL（ioredis）；Serverless 可用 Upstash REST。
  // 多实例（如 PM2 cluster）下必须配置其一，否则各进程计数不共享。
  REDIS_URL: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  // 可选：支付宝（电脑网站支付）。配齐后走真实结账，否则回退模拟到账。
  ALIPAY_APP_ID: z.string().min(1).optional(),
  ALIPAY_PRIVATE_KEY: z.string().min(1).optional(),
  ALIPAY_PUBLIC_KEY: z.string().min(1).optional(),
  ALIPAY_GATEWAY: z.string().url().optional(), // 沙箱：https://openapi-sandbox.dl.alipaydev.com/gateway.do
  // 可选：微信支付（Native 扫码）。配齐后走真实结账，否则回退模拟到账。
  WECHAT_APP_ID: z.string().min(1).optional(),
  WECHAT_MCH_ID: z.string().min(1).optional(),
  WECHAT_API_V3_KEY: z.string().min(1).optional(),
  WECHAT_PRIVATE_KEY: z.string().min(1).optional(), // apiclient_key.pem 内容
  WECHAT_CERT: z.string().min(1).optional(), // apiclient_cert.pem 内容
  WECHAT_CERT_SERIAL: z.string().min(1).optional(),
  // 可选：Sentry 错误追踪。配置后 captureError 上报，否则仅结构化日志。
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().min(1).optional(),
  // 可选：Resend 邮件。配置后发送真实邮件，否则记录日志后跳过。
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  REDIS_URL: process.env.REDIS_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  ALIPAY_APP_ID: process.env.ALIPAY_APP_ID,
  ALIPAY_PRIVATE_KEY: process.env.ALIPAY_PRIVATE_KEY,
  ALIPAY_PUBLIC_KEY: process.env.ALIPAY_PUBLIC_KEY,
  ALIPAY_GATEWAY: process.env.ALIPAY_GATEWAY,
  WECHAT_APP_ID: process.env.WECHAT_APP_ID,
  WECHAT_MCH_ID: process.env.WECHAT_MCH_ID,
  WECHAT_API_V3_KEY: process.env.WECHAT_API_V3_KEY,
  WECHAT_PRIVATE_KEY: process.env.WECHAT_PRIVATE_KEY,
  WECHAT_CERT: process.env.WECHAT_CERT,
  WECHAT_CERT_SERIAL: process.env.WECHAT_CERT_SERIAL,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
});

export const isProd = env.NODE_ENV === "production";
