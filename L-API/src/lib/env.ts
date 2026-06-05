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
  // 可选：配置后限流计数走 Redis（多实例/Serverless 共享），否则用内存。
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

export const env = schema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const isProd = env.NODE_ENV === "production";
