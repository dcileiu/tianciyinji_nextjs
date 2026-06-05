# Project Notes

## 环境 / 校验
- 包管理器是 pnpm（见 `packageManager` 字段），Node >= 22。
- 校验命令：`pnpm lint`（`oxlint .`）、`pnpm typecheck`（`tsc --noEmit`）、`pnpm build`（`next build`）。
- `next build` 时会跳过类型校验，需要类型检查请单独跑 `pnpm typecheck`。

## 开发总原则（每次改动都要遵守）
- **统一 UI 与主题**：复用现有设计语言（紫色系渐变、圆角卡片、`#5b3df5` 主色、统一的间距/阴影），新组件沿用既有 Tailwind 风格与配色变量；同时支持亮/暗两套主题（`dark:` 变体不能漏），不要引入风格突兀的样式。
- **SEO / GEO 优先**：页面要有完整 metadata（title/description/keywords、OG 图）、JSON-LD 结构化数据、按页面语言设置 `inLanguage` 与 hreflang；内容尽量服务端渲染、可被爬虫与生成式 AI 抓取，新页面/新菜单同步补齐这些。
- **渲染性能**：保证首屏与导航速度，避免拖慢体验与 SEO。优先静态/ISR（保持页面为 `○`/`●`，别退化成 `ƒ`）；大组件用 `next/dynamic` 懒加载、非关键内容空闲后再挂载；控制首屏 JS 体积与主线程占用；改完用 `pnpm build` 确认路由静态状态没有退化。

## i18n 与静态渲染（重要约定）
- 路由用 `[locale]` 段；页面里取语言一律用 `params.locale`（配合 `normalizeLocale`），不要用 `getLocale()`（读 cookie）。
- 页面组件里使用 `getLocale()` 或 `searchParams` 会让该页退化成动态渲染（构建里显示 `ƒ`），失去静态预渲染与路由预取，导航会变慢。需要静态的页面应保持 `params.locale`，把对 URL query 的读取下沉到客户端组件。
- 客户端组件读取 `?xxx=` 这类 query 时，优先用 `useSyncExternalStore`（首帧即拿到值、避免 `useEffect` 造成的内容闪动），而不是挂载后再 `setState`。
