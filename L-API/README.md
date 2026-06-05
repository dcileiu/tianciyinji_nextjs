# L-API · 企业级 API 平台

基于 Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui 构建的 API 平台,包含公开站点与登录后的控制台。后端使用 MySQL + Prisma + Auth.js v5。

## 技术栈

- **框架**: Next.js 16 (App Router, RSC, Server Actions)
- **UI**: Tailwind CSS v4 + shadcn/ui (Base UI, new-york 风格, OKLCH 高级紫主题) + lucide-react + recharts
- **后端**: MySQL + Prisma 6,业务层在 `src/server/services`
- **鉴权**: Auth.js v5 (Credentials + JWT 会话 + Prisma Adapter, bcryptjs 哈希)
- **校验**: zod (含环境变量校验 `src/lib/env.ts`)
- **工程**: pnpm · oxlint (lint) · biome (format) · GitHub Actions CI

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 准备环境变量
cp .env.example .env   # 按需修改；AUTH_SECRET 可用 `npx auth secret` 生成

# 3. 启动 MySQL（需要 Docker）
docker compose up -d

# 4. 建表并灌入种子数据
pnpm db:push
pnpm db:seed

# 5. 启动开发服务器
pnpm dev
```

打开 http://localhost:3000 。演示账号见种子数据输出(默认 `demo@l-api.dev` / `demo1234`)。

## 常用脚本

| 脚本 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 (Turbopack) |
| `pnpm build` | `prisma generate` + 生产构建 |
| `pnpm lint` / `pnpm lint:fix` | oxlint 检查 / 自动修复 |
| `pnpm format` / `pnpm format:check` | biome 格式化 / 校验 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm db:push` / `pnpm db:migrate` | 同步 / 迁移数据库结构 |
| `pnpm db:seed` | 灌入种子数据 |
| `pnpm db:studio` | 打开 Prisma Studio |

## 目录结构

```
src/
  app/
    (marketing)/   # 公开站点：首页 / API 列表 / 详情 / 价格 / 热榜 / 工具
    (auth)/        # 登录、注册
    dashboard/     # 控制台（受 proxy.ts 保护）
    api/
      auth/        # Auth.js 路由
      v1/[slug]/   # 内置示例接口（校验 key、写日志、扣积分）
  server/
    auth/          # Auth.js 配置
    services/      # 业务层（Prisma 访问）
  components/      # UI 组件（ui/ 为 shadcn）
  lib/             # env、prisma、工具
prisma/            # schema 与 seed
```

## 说明

- 第一版以中文为主;API 调用与计费使用内置示例接口 + 种子数据模拟,不接真实支付与第三方服务。
- 未连接数据库时仍可完成 `pnpm build`(公开页做了优雅降级),但功能需连上 MySQL 才完整。
