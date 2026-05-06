# Blog Starter 

这个版本已经切成了“本地内容 + 本地图片”的简单工作流：

- 博客文章放在 `content/posts/`
- 资源页内容放在 `content/resources/`
- 所有图片放在 `public/content/`
- Markdown 里直接引用项目内图片路径，例如 `/content/posts/welcome/cover.jpg`

## 先改哪里

如果你要把它换成自己的个人站，优先改这几个地方：

- 站点身份配置：`src/lib/site-config.ts`
- 示例文章：`content/posts/welcome.md`
- 示例资源：`content/resources/blog-writing-checklist.md`
- 站点头像：`public/content/site/avatar.svg`

## 目录约定

```text
content/
  posts/
    welcome.md
  resources/
    blog-writing-checklist.md

public/
  content/
    site/
      avatar.svg
    posts/
      welcome/
        desk-setup.svg
```

## 文章 Frontmatter 示例

```yaml
---
title: 欢迎来到你的新个人站
date: 2026-05-06
excerpt: 这是一篇示例文章，你可以直接从这里开始写自己的博客。
author: 你的名字
authorAvatar: /content/site/avatar.svg
category: 建站
tags:
  - 博客
  - Next.js
coverImage: /content/posts/welcome/desk-setup.svg
---
```

## 资源 Frontmatter 示例

```yaml
---
title: 发文前检查清单
date: 2026-05-06
excerpt: 一个适合个人博客的发文前自检模板。
type: document
format: Markdown
size: 1 KB
tags:
  - 写作
  - 工作流
resourceDetails:
  来源: 站内示例
  存放位置: content/resources
usage:
  - 发文前自检
---
```

## 图片怎么放

1. 在 `public/content/` 下新建与文章相关的目录
2. 把图片放进去
3. 在 Markdown 中直接写绝对路径

```md
![配图说明](/content/posts/my-second-post/cover.jpg)
```

## 当前工作流

1. 新建或修改 `content/posts/*.md`
2. 把配图放进 `public/content/...`
3. 运行 `pnpm dev`
4. 完成后直接构建部署

## 可用脚本

- `pnpm lint`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`
- `pnpm build`

## 现在不需要的东西

当前这套本地内容模式不依赖下面这些能力：

- Redis
- Gitee webhook
- 图片 OSS 同步

仓库里还保留了一些旧的实验页和历史代码，但博客、资源、RSS、搜索都已经改成读取本地内容了。
