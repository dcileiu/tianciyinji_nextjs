# L-API Project Notes

## 开发总原则（每次改动都要遵守）
- 统一 UI 与主题：复用设计系统(高级紫主色、shadcn/ui 组件、统一圆角/间距/阴影),亮暗双主题不能漏 `dark:`,不要引入风格突兀的样式。
- SEO / GEO 优先：页面要有完整 metadata(title/description/OG)、JSON-LD、`sitemap.ts`/`robots.ts`;公开内容尽量服务端渲染、可被爬虫与生成式 AI 抓取,新页面同步补齐。
- 渲染性能：保证首屏与导航速度。公开页优先静态/ISR,控制端组件懒加载,控制首屏 JS;改完用 `pnpm build` 确认。

## 环境 / 校验
- 包管理器 pnpm,Node >= 20。校验:`pnpm lint`(oxlint)、`pnpm format:check`(biome)、`pnpm typecheck`(tsc)、`pnpm test`(vitest)、`pnpm build`。
- 测试:Vitest,纯逻辑单测放在 `src/**/*.test.ts`(无 DB);Node 环境通过 `vitest.config.ts` 桩掉 `server-only`。

## 可观测性 / 性能
- 健康检查:`GET /api/health`(探活 DB + 限流后端,降级返回 503)。
- 日志/错误:`src/lib/logger.ts`(结构化日志)、`src/lib/observability.ts` 的 `captureError`(统一上报入口,接 Sentry 在此处接)。
- 用量写入异步化:接口调用经 `src/server/logging/usage-recorder.ts` 缓冲批量写 `RequestLog` 并增量汇总到 `UsageDaily`;积分扣减仍同步保证一致。仪表盘概览/趋势/Top 读 `UsageDaily`,明细列表读 `RequestLog`。
- 密钥安全:`ApiKey` 支持 `scopes`(分类白名单)、`expiresAt`(过期)、`rateLimitPerMin`(每分钟覆盖)、`dailyQuota`(独立每日配额),均在 `/api/v1/[slug]` 校验。
- 数据库:MySQL + Prisma(v6)。本地 `docker compose up -d` 起 MySQL,然后 `pnpm db:push` 建表、`pnpm db:seed` 灌种子数据。
- 鉴权:Auth.js v5(Credentials + JWT 会话 + Prisma adapter),配置见 `src/server/auth/`。
- 环境变量集中在 `src/lib/env.ts`(zod 校验),示例见 `.env.example`。

## 安全 / 限流 / 风控
- 策略默认值在 `src/lib/rate-policies.ts`(纯常量);**运行时生效值由超管在后台编辑**,存 `SecurityPolicy` 表,经 `src/server/security/settings.ts` 合并(默认值+DB 覆盖+30s 缓存,DB 不可用回退默认)。改默认值改常量;改线上值走后台「安全策略」页。
- 前台 / 后台分离:`/dashboard` 是面向用户的**前台控制台**;`/admin` 是独立的**超管后台**(`requireAdmin` 守卫 + `proxy.ts` 按 JWT 角色拦截,非管理员回退 `/dashboard`)。管理员从前台用户菜单「管理后台」进入。
- 后台模块:概览、用户管理(调整积分/设置角色)、API 管理(价格/状态/推荐)、订单管理(收入统计)、安全策略。数据服务在 `src/server/services/admin.ts`,操作在 `src/server/actions/admin.ts`,组件在 `src/components/admin/`。后台敏感操作写入 `SecurityEvent`(type=`ADMIN`)审计。
- 超管后台「安全策略」`/admin/security`:编辑各限流/风控阈值与启用开关、手动封禁/解封 IP/密钥/用户、查看全局安全事件。Server Actions 见 `src/server/actions/admin.ts`,保存后 `invalidatePolicyCache()` 立即生效。后台组件在 `src/components/admin/`。
- 安全 API 在 `src/server/security/`:`rateLimit`(吞吐限流)、`registerFailure`/`isBanned`/`unban`(防爆破/封禁)、`banEntity`(手动封禁)、`recordApiError`(滥用自动封禁)、`logSecurityEvent`(审计)、`getClientIp`。限流读取动态策略,`enabled=false` 时直接放行。
- 种子含超管账号:`admin@l-api.dev / admin1234`。
- 存储抽象 `RateStore`:默认进程内内存(单实例);配置 `UPSTASH_REDIS_REST_URL/TOKEN` 后自动切换 Redis(多实例/Serverless 共享计数)。
- `/api/v1/[slug]` 已接入:IP/密钥限流、每日配额、封禁校验、`429`+`X-RateLimit-*`/`Retry-After` 头、CORS、错误过多自动封禁密钥。
- 登录防爆破在 `src/server/auth/auth.ts`(邮箱+IP 锁定);注册/演示在各自 action 内按 IP 限流。
- 安全响应头在 `next.config.ts`;审计事件写入 `SecurityEvent` 表,展示于控制台「安全中心」。

## 目录约定
- `src/app/(marketing)` 公开站点、`src/app/(auth)` 登录注册、`src/app/dashboard` 前台控制台、`src/app/admin` 超管后台(均受 `proxy.ts` 保护)。
- `src/server/services/*` 业务层(集中 Prisma 访问 + zod 校验)。
- `src/server/security/*` 限流与风控(存储抽象 + 限流/封禁/审计 API)。
- `src/app/api/v1/[slug]` 内置示例接口(校验 API key、限流、写日志、扣积分)。
