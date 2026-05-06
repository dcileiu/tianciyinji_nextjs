---
title: 欢迎来到你的新个人站
date: 2026-05-06
excerpt: 这是一篇示例文章，用来确认现在的博客已经切成了本地 Markdown 工作流。
author: 你的名字
authorAvatar: /content/site/avatar.svg
category: 建站
tags:
  - 博客
  - Next.js
coverImage: /content/posts/welcome/desk-setup.svg
---

这篇文章用来确认现在的博客流程已经变成了最简单的一种：

- 文章写在 `content/posts/`
- 图片放在 `public/content/`
- 正文里直接引用项目里的静态图片路径

比如下面这张图，走的就是项目本地静态资源：

![工作台插图](/content/posts/welcome/desk-setup.svg)

## 以后怎么写新文章

你只需要继续新增 Markdown 文件，例如：

```text
content/posts/my-second-post.md
```

如果文章有配图，就把图片放到：

```text
public/content/posts/my-second-post/
```

然后在正文里这样引用：

```md
![配图说明](/content/posts/my-second-post/cover.jpg)
```

## 为什么这种方式适合个人站

第一，它维护成本低，不需要 Redis、Webhook 或额外同步服务。  
第二，它和 Git 工作流天然兼容，文章、图片、代码都在一个项目里。  
第三，后面如果你想把图片迁移到 OSS，也只需要调整图片 URL 规则，不需要重写文章内容。
