---
title: 用 n8n + GPT 搭一条全自动 AI 新闻工作流：抓取、多语言改写、配图、上线 CMS、刷站点地图、钉钉通知
date: 2026-05-16
excerpt: 从指定新闻网站获取当日新闻并联网搜索判断当下最热新闻热点，查库去重避免重复发稿，再经 GPT 多语言改写、配图，自动上线 CMS 并钉钉通知。
author: Dci
authorAvatar: /content/site/avatar.svg
category: 自动化
tags:
  - n8n
  - GPT
  - 工作流
  - CMS
  - 钉钉
  - 数据库
coverImage: /content/posts/ai-news-workflow/AI新闻工作流.png
---

有一段时间，团队里每天要花不少时间在「搬运 + 改写 + 配图 + 发站」上：盯几个资讯站、复制标题正文、翻译成繁中/英文、找图或让设计出封面、登录 CMS 填表发布，最后还得记得更新站点地图、在群里吼一声「发好了」。

这些事单看都不难，但串在一起就是典型的重复劳动。于是我们干脆用 **n8n** 把整条链路自动化：开头不是死盯 RSS，而是 **联网搜索 + GPT 判断当前最热的新闻热点**；中间用 **数据库查库、存库**，已经写过的选题直接跳过；后面才是改写、配图、多语言发布和钉钉通知。

这记录的是我们画布上真实在跑的那套，不是概念 PPT。

![n8n 工作流总览](/content/posts/ai-news-workflow/AI新闻工作流.png)

## 目标：端到端无人值守

一句话描述终态：

> 整合监控 URL → **联网搜索筛选当下热点** → **查库判断是否已写过** → 拉详情并解析 HTML → GPT 改写文章 → 生成并上传封面 → **繁中 / 英文等多语言改写** → 发布 CMS → 刷新 sitemap → 钉钉通知；已存在的选题自动剔除并回到搜索。

人工只介入两类情况：**详情页结构变了**（解析失败走钉钉「失败通知」）或 **GPT 输出需要抽检**。

## 整体架构

```text
[定时 / 手动触发]
    → 整合 URL 列表
    → 联网搜索 + GPT 筛选「当前最热」候选标题
    → 查库：标题 / URL 是否已存在
        ├─ 已存在 → 从候选数组移除该条 → Wait → 回到搜索（换下一个热点）
        └─ 不存在 → 获取新闻详情 → 从 HTML 提取正文
            ├─ 提取失败 → 钉钉失败通知
            └─ 成功 → 改写正文 → 生成封面 → 上传 CMS → 多语言分支 → 发布 → sitemap → 钉钉成功通知
```

n8n 负责调度、分支、循环和告警；GPT（经兼容 OpenAI 的 HTTP 网关）负责「什么是热点」「怎么写」「翻译成繁中/英文」；**数据库** 负责「这篇已经发过没有」。

## 第一步：整合 URL + 联网搜索热点

和传统「只订阅 RSS、按时间排序」不同，我们工作流前半段的重点是 **主动发现热点**。

### 整合 URL（`整合URL` Code 节点）

维护一份 **待监控站点 / 频道 URL 列表**（科技媒体、官方博客、行业门户等），在 Code 节点里拼成数组或一段上下文，交给下一步的搜索 Prompt。这里不一定要立刻抓取全文，先告诉模型「在这些领域里找」。

### 联网搜索筛选热点（HTTP + GPT）

通过 `HTTP Request` 调用带 **联网 / Search** 能力的 Chat API（我们走兼容 OpenAI 的网关），让模型：

1. 结合当前时间，在指定 URL 对应的信息源范围内检索；
2. 输出 **当下讨论度最高** 的若干条新闻 **标题**（可带简短理由）；
3. 返回结构化 JSON，便于后面 `筛选` 节点清洗。

`筛选` 再用 Code 节点做兜底：去空标题、去重、限制条数（例如一次只处理 1～3 条，避免爆量）。

**为什么不用纯 RSS？** RSS 告诉你「发布了什么」，不告诉你「现在什么最火」。联网搜索 + 模型归纳，更接近编辑选题会做的判断——当然最终仍以查库和正文质量为准。

## 第二步：查库存库，避免重复发稿

这是整条链路里最容易被忽略、但最省事故的一环：**必须落库**。

### 查库（`查库` 节点）

用数据库节点（MySQL / Postgres / Supabase / Airtable 均可）按 **标题 hash** 或 **canonical URL** 查询是否已有记录。表结构建议至少包含：

| 字段              | 说明                              |
| ----------------- | --------------------------------- |
| `id`              | 主键                              |
| `title_hash`      | 标题归一化后的 hash，防同题异 URL |
| `source_url`      | 原文链接，唯一索引                |
| `slug` / `cms_id` | 发布后回写，方便对账              |
| `published_at`    | 上线时间                          |
| `locales`         | 已发语言，如 `zh-CN,zh-TW,en`     |

### 分支：数据是否存在（`数据是否存在` IF）

- **已存在（true）**：走 `返回移除了该条数据的新标题数组`，从当前热点列表里删掉这一条，接 `Wait` 稍作间隔后 **回到联网搜索**，让模型在剩余候选里再挑，或重新搜一轮。这样不会出现「昨天写过的题今天又因为热搜再发一遍」。
- **不存在（false）**：进入 `获取新闻详情内容` → `从html中提取内容`，继续后续 AI 流程；**发布成功后** 再 **写入同一张表**，形成闭环。

幂等键推荐：`source_url` 优先，没有稳定 URL 时用 `title_hash`。

**实践建议：**

- 查库放在 **拉详情之前**，能省大量无效 HTTP 和 GPT 费用。
- 存库放在 **CMS 发布成功之后**，失败不入库，方便重跑。
- 只抓正文区域，用 Readability 思路在 `从html中提取内容` 里剥掉导航、广告。
- 解析失败走 `失败通知` 钉钉分支，不要静默重试到死。

## 第三步：获取详情、改写与多语言

采集结果先归一成一条 **中间 JSON**，再喂给 GPT。这样多语言、配图提示词、CMS 字段都能从同一份结构派生。

```json
{
  "source": { "id": "...", "url": "...", "title": "..." },
  "body_plain": "原文纯文本...",
  "targets": ["zh-CN", "zh-TW", "en"]
}
```

### System Prompt 要点

- 角色：科技资讯编辑，不是翻译机。
- 输出：**严格 JSON**，包含各语言的 `title`、`excerpt`、`body_markdown`、`seo_keywords`、`slug`。
- 约束：不捏造事实；数字、产品名、公司名保持可核对；敏感内容标记 `needs_review: true`。

### n8n 里的并行多语言

用 `Split In Batches` 或 `Loop Over Items` 对 `targets` 数组循环，每个语言一次 `OpenAI` / `HTTP Request`（兼容 API）节点。`slug` 建议：

- 主语言（如中文）用 GPT 生成的拼音/英文 slug；
- 其他语言用 `en-{base-slug}` 或 CMS 的 `locale` 字段关联同一 `translation_group_id`。

画布上在正文改写完成后，会 **并行分出** `改写为繁中`、`改写为英文` 等 HTTP 节点，各自调一次 GPT，再分别写入 CMS 对应 `locale`。我们在 CMS 侧增加了 `translationGroupId`，把同一选题的多语言版本绑在一起。

### 质量闸门（可选但推荐）

GPT 返回后加一层 **规则 + 小模型抽检**：

- JSON 能否 `JSON.parse`；
- 各语言 `title`、`body` 非空；
- 正文字数在合理区间；
- `needs_review === true` 时走「待审核」分支，不自动发布。

## 第四步：封面图生成与上传 CMS

通过查库之后的主线里，顺序大致是：

1. **`改写生成文章`**：HTTP 调 GPT，输出 Markdown / 富文本字段；
2. **`根据内容生成封面图`**：再调图像 API，按标题+摘要生成封面；
3. **`图片转换成二进制流`**：Code 节点把 base64 / URL 转成 n8n 可上传的二进制；
4. **`上传封面图` / `发布图片到线上`**：POST 到自建 CMS 媒体接口，拿回公网 `coverImage` URL，再挂到文章记录上。

## 第五步：自动发布到自有 CMS

CMS 需提供稳定的 **REST / GraphQL**，至少支持：

- `POST /articles` 创建；
- `PUT /articles/:id` 更新；
- `locale`、`status`（`draft` | `published`）、`publishedAt`；
- `coverImage`、`tags`、`category`。

n8n 用 `HTTP Request` 节点，Header 带 `Authorization: Bearer <token>`。每种语言一次请求；全部成功后再进入「发布收尾」子流程。

伪代码逻辑：

```text
for each locale in article.locales:
  POST /api/posts
  if 409 slug 冲突 → PUT 更新同 slug
collect published_urls[]
```

若 CMS 背后是 **Git + Markdown**（类似本站 `content/posts/*.md`），也可以：

- n8n 调 GitHub API 提交 `.md` 与图片；
- 触发 CI 构建；
- 构建完成 webhook 再回到 n8n 执行 sitemap。

我们两条路都试过，**API 直写数据库** 反馈更快；**Git 提交** 更适合静态站、要 PR 审核的场景。

## 第六步：刷新站点地图

发布成功后必须更新 sitemap，否则搜索引擎和新访客会晚一步发现内容。

常见做法：

1. **构建时生成**（Next.js `app/sitemap.ts`）：触发一次 **redeploy** 或 **on-demand revalidation**（`POST /api/revalidate?path=/sitemap.xml`）。
2. **动态 sitemap 路由**：读数据库最新 `publishedAt`，则只需 revalidate，不必全站构建。
3. **独立脚本**：`curl https://yoursite.com/sitemap.xml` 仅作探测；真正刷新靠 ISR / webhook。

n8n 在 CMS 返回 200 后增加节点：

```text
HTTP POST https://cms.example.com/api/revalidate
Body: { "paths": ["/sitemap.xml", "/", "/post/{slug}"] }
```

失败重试 3 次，仍失败则钉钉告警，但 **不要回滚已发布文章**（避免内容丢失）；人工补刷 sitemap 即可。

## 第七步：钉钉通知「已上线」

用钉钉群 **自定义机器人 Webhook**，消息体推荐 **Markdown**：

```markdown
## 新文章已自动发布

**中文标题**：xxx  
**英文标题**：xxx  

- [查看中文](https://site.com/post/xxx)  
- [View EN](https://site.com/en/post/xxx-en)  

源站：[原文链接](https://source.com/...)  
发布时间：2026-05-16 14:30  
工作流执行 ID：`{{ $execution.id }}`
```

n8n 节点：`HTTP Request` → `POST` 钉钉 URL，`msgtype: markdown`。若需 @所有人，仅在 `needs_review` 或失败时使用，避免日常轰炸。

工作流里已有 **`失败通知`** 节点：正文提取失败、HTTP 4xx/5xx 等走钉钉；成功发布走另一条 Markdown 通知。建议所有失败统一带上 `execution.id`，方便在 n8n 里点开排查。

## 画布节点对照（便于对照截图）

| 节点名                      | 作用                             |
| --------------------------- | -------------------------------- |
| 整合URL                     | 汇总待监控站点 URL               |
| 联网搜索筛选热点            | GPT + 联网，输出当前最热标题列表 |
| 筛选                        | 清洗、去重、限流                 |
| 查库                        | 按标题/URL 查是否已发稿          |
| 数据是否存在                | 有则剔除并回环搜索，无则继续     |
| 获取新闻详情内容            | 请求原文页面                     |
| 从html中提取内容            | 解析正文；失败 → 失败通知        |
| 改写生成文章                | GPT 改写成博文                   |
| 根据内容生成封面图          | 图像 API                         |
| 图片转换成二进制流          | 准备上传体                       |
| 上传封面图 / 发布图片到线上 | CMS 媒体接口                     |
| 改写为繁中 / 改写为英文     | 多语言并行改写                   |
| 失败通知                    | 钉钉 Webhook                     |

## n8n 工作流怎么拆

不要把所有节点塞在一个 Workflow 里。我们拆成：

| 子流程            | 职责                             |
| ----------------- | -------------------------------- |
| `01-ingest`       | 整合 URL + 联网搜热点 + 查库回环 |
| `02-ai-transform` | GPT 改写 + 多语言                |
| `03-media`        | 配图生成与上传                   |
| `04-publish`      | CMS 写入 + sitemap               |
| `05-notify`       | 钉钉成功/失败                    |

主流程用 **`Execute Workflow`** 串联，便于单独重跑「从配图开始」而不重新抓源站。

**密钥：** OpenAI、CMS Token、钉钉 Webhook 全部放 n8n Credentials，不要写进 Code 节点。

**幂等：** 以 `source_url` + 数据库唯一索引 为业务主键；CMS 侧 `upsert`；查库命中则绝不二次发稿。

## 成本与踩坑

- **联网搜索**：比纯 RSS 多一轮 API；控制 Prompt 返回条数，查库尽早拦截重复选题。
- **回环搜索**：`数据是否存在 → 移除 → Wait → 再搜` 要设最大循环次数，防止极端情况下空转。
- **GPT 费用**：长文全文改写最贵。可先摘要再扩写，或只改写标题+导语+前三段，其余模板化。
- **图像 API**：封面固定尺寸（如 1200×630）比随意尺寸省额度。
- **源站 ToS**：自动化抓取前看清 robots 与版权；优先 RSS、合作源。
- **时区**：`publishedAt` 统一 UTC 存，展示再转本地。
- **GPT 幻觉**：科技新闻务必保留「据 xxx 报道」类出处句，或文末附 `source_url`。

## 小结

这条链路的核心不是「又一个 ChatGPT 花活」，而是：

1. **联网搜索** 解决「写什么」——跟热点走，而不是跟 feed 时间走；
2. **查库 / 存库** 解决「别重复写」——已存在的选题自动跳过并换题；
3. **n8n** 把分支、回环、重试、钉钉告警做扎实；
4. **GPT + CMS API** 负责生成与上线。

我们从「半天发一篇多语言稿」压到「热点出现后十几分钟内自动上线」，人工主要维护 URL 白名单、数据库和 Prompt。若你也在用 Next.js + Markdown 或自研 CMS，把发布与 sitemap 两节换成自己的接口即可，**搜热点 + 查库** 这两段可以直接照搬。

如果你希望，后续可以补一篇 **n8n 导出 JSON 模板** 或 **GPT Prompt 全文**，放在仓库的 `docs/` 里当附录。
