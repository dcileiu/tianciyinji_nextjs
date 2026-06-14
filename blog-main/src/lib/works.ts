import type { Locale } from './i18n';

/**
 * 作品数据
 * ──────────────────────────────────────────────
 * 想加一个新作品，复制下面任意一个 { ... } 块改内容即可。
 * 截图放到 public/works/ 下，例如 public/works/blog/1.png，
 * 然后在 images 里写 '/works/blog/1.png'，支持一张或多张（多张会自动变成轮播）。
 */

export interface WorkItem {
  /** 作品标题 */
  title: string;
  /** 一句话简介（卡片上显示） */
  summary: string;
  /** 详细描述（可选，支持多段，用数组分段） */
  description?: string[];
  /** 年份或时间，如 “2025” / “进行中” */
  year: string;
  /** 状态标签，如 “已上线” / “开发中” / “持续更新” */
  status: string;
  /** 技术栈 / 标签 */
  tags: string[];
  /** 访问链接（站内或站外，可选） */
  href?: string;
  /** 链接按钮文案（默认“查看作品”） */
  linkLabel?: string;
  /** 截图列表，1 张或多张；多张时自动展示为轮播。留空则显示渐变占位图 */
  images?: string[];
  /** 是否重点展示（置顶 + 更大尺寸） */
  featured?: boolean;
}

export const worksIntro =
  '这里收录我做过的项目、产品与实验，点开可以查看简介、截图、用到的技术和相关链接。';

export const works: WorkItem[] = [
  {
    title: '品牌官网',
    summary: '正在打造的 Next.js 企业品牌网站，前台有丰富的交互动画，内置智能问答机器人，后台支持全站 10 种语言管理。',
    description: [
      '面向品牌展示与业务转化的 Next.js 官网项目。页面里塞了不少有意思的交互动效——滚动叙事、元素进场、悬停反馈等，让整站浏览起来像在读一本会动的画册，而不只是静态信息堆砌。',
      '站点集成了智能问答机器人，访客可以直接用自然语言咨询产品、服务与常见问题，减少跳转成本，也让品牌侧多了一个 24 小时在线的接待入口。',
      '配套完整的后台管理系统，文章、页面模块、媒体资源都能在一个面板里维护；全站内容支持 10 种语言，方便面向不同地区市场做本地化运营。',
    ],
    year: '2026',
    status: '开发中',
    tags: ['Next.js', 'Motion', 'AI Chatbot', 'i18n', 'Admin'],
    href: 'https://ryoex.com',
    linkLabel: '访问官网',
    images: ['/works/brand/brand-1.webp', '/works/brand/brand-2.webp', '/works/brand/brand-3.webp'],
    featured: true,
  },
  {
    title: 'API 文档协同编辑系统',
    summary: '基于 Vue 的 API 文档多人协同编辑平台，Logo 动画与主题切换过渡是亮点；文档内容内部使用，需登录后查看。',
    description: [
      '一套面向团队内部的 API 文档协同编辑系统，用 Vue 全栈搭建。多人可同时维护接口说明、调试示例与版本记录，减少文档散落在各处、各写各的问题。',
      '视觉上有两个我比较得意的细节：Logo 进场与状态变化做了连贯动画，切换明暗主题时也不是硬切，而是带过渡的翻转/渐变效果，文档站也能有一点产品感。',
      '涉及业务接口与协作内容，不便对外公开展示，访问需登录鉴权。作品页仅展示外壳界面与动效截图。',
    ],
    year: '2025',
    status: '内部使用',
    tags: ['Vue', 'TypeScript', 'API Docs', 'Collaboration', 'Motion'],
    href: 'https://apidocs.aletaplanet.com/web/login',
    linkLabel: '登录系统',
    images: ['/works/doc-api/doc-api-1.webp', '/works/doc-api/doc-api-2.webp'],
  },
  {
    title: '桃子熊卡支付金融系统',
    summary: '面向桃子熊卡业务的支付与金融后台，涵盖交易、账务与风控等核心流程，系统内部运行不便对外展示。',
    description: [
      '参与开发的支付金融类内部系统，服务于桃子熊卡相关业务的资金流转与后台管理。',
      '涉及支付链路、账务处理与业务风控等模块，属于生产环境使用的金融系统，界面与数据均不便公开展示，作品页仅作项目记录。',
    ],
    year: '长期维护',
    status: '内部使用',
    tags: ['Fintech', 'Payment', 'Financial', 'Admin', 'Internal'],
    images: [],
  },
  {
    title: 'Aleta Planet Card 管理系统',
    summary: 'Aleta Planet Card 的后台管理系统，负责卡片、商户与相关业务配置，为内部运营团队使用。',
    description: [
      '面向 Aleta Planet Card 业务的卡片管理后台，支撑卡片生命周期、商户信息与日常运营配置等管理工作。',
      '系统部署于内网/权限环境，涉及客户与交易数据，不提供对外访问与截图展示，此处仅记录项目经历与技术参与范围。',
    ],
    year: '长期维护',
    status: '内部使用',
    tags: ['Card Management', 'Fintech', 'Admin', 'Operations', 'Internal'],
    images: [],
  },
  {
    title: 'CI 自动化',
    summary: '持续集成与部署相关的自动化方案，把构建、检查与发布流程串成可复用的流水线。',
    description: [
      '长期维护的 CI 自动化实践，覆盖代码提交后的自动构建、质量检查与部署触发，减少手工重复操作。',
      '通过流水线把 lint、测试、构建等步骤标准化，让多个项目都能沿用同一套自动化流程。',
    ],
    year: '长期维护',
    status: '持续更新',
    tags: ['CI/CD', 'GitHub Actions', 'Automation', 'DevOps'],
    images: ['/works/CI/image.webp'],
  },
  {
    title: '微信小程序',
    summary: '自研的三款微信小程序：麻上计分、去水印壁纸鸭、洛克万能助手，覆盖娱乐工具与游戏辅助场景。',
    description: [
      '麻上计分：朋友组局打麻将时的记账工具，免费无广告，支持建房、加减分、结算与历史记录，附带打牌间隙会用的小功能。',
      '去水印壁纸鸭：解析抖音、小红书、公众号等平台的分享链接，一键去水印保存图片与壁纸，顺手解决「刷到好图却带水印」的痛点。',
      '洛克万能助手：面向《洛克王国：世界》玩家的工具小程序，可查远行商人、孵蛋、家园与玩家信息，少开游戏也能确认关键数据。',
    ],
    year: '长期维护',
    status: '已上线',
    tags: ['微信小程序', 'uni-app', 'Tools', 'Game'],
    images: [
      '/works/xcx/麻将计分-0.webp',
      '/works/xcx/麻将计分-1.webp',
      '/works/xcx/去水印壁纸鸭.webp',
      '/works/xcx/洛克万能助手远行商人.webp',
    ],
  },
  {
    title: '个人博客',
    summary: '用 Next.js 搭建的个人站点，发布文章、整理作品、沉淀资源与一套在线工具箱。',
    description: [
      '从零搭建的全栈个人站点，支持 Markdown / Obsidian 写作、文章归档、资源库与几十款在线小工具。',
      '注重阅读体验与性能：暗色模式、响应式布局，并对首屏加载做了持续优化。',
    ],
    year: '进行中',
    status: '已上线',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Markdown'],
    href: '/',
    linkLabel: '进入首页',
    images: ['/works/blog/blog-new.webp', '/works/blog/blog-new2.webp'],
  },
];

const worksEn: WorkItem[] = [
  {
    title: 'Brand Website',
    summary:
      'An enterprise brand site in active development, built with Next.js, with rich interactive animations, an intelligent Q&A chatbot, and an admin panel for managing the full site in 10 languages.',
    description: [
      'A Next.js brand website built for storytelling and conversion. The front end is packed with engaging motion—scroll-driven narratives, staged entrances, and hover feedback—so browsing feels like flipping through a living brochure, not reading a flat brochure PDF.',
      'An intelligent Q&A chatbot is built in, so visitors can ask about products, services, and FAQs in natural language without hunting through pages—giving the brand a always-on reception desk.',
      'A full admin backend keeps articles, page modules, and media in one place. The entire site supports 10 languages, making it easier to localize content for different regional markets.',
    ],
    year: '2026',
    status: 'In development',
    tags: ['Next.js', 'Motion', 'AI Chatbot', 'i18n', 'Admin'],
    href: 'https://ryoex.com',
    linkLabel: 'Visit site',
    images: ['/works/brand/brand-1.webp', '/works/brand/brand-2.webp', '/works/brand/brand-3.webp'],
    featured: true,
  },
  {
    title: 'API Docs Collaborative Editor',
    summary:
      'A Vue-based API documentation platform for multi-user collaborative editing, with standout logo and theme-switch animations. Internal use only.',
    description: [
      'An internal API documentation system built with Vue across the stack, where multiple teammates can maintain endpoint specs, try-it examples, and version history together—instead of docs living in scattered files.',
      'Two motion details I am especially happy with: the logo has a cohesive entrance and state animation, and light/dark theme changes use a smooth transition instead of a hard cut—so even a docs site feels a bit like a product.',
      'Content involves business APIs and team collaboration data, so it is not publicly available and requires login. The portfolio only shows shell UI and motion screenshots.',
    ],
    year: '2025',
    status: 'Internal',
    tags: ['Vue', 'TypeScript', 'API Docs', 'Collaboration', 'Motion'],
    href: 'https://apidocs.aletaplanet.com/web/login',
    linkLabel: 'Visit site',
    images: ['/works/doc-api/doc-api-1.webp', '/works/doc-api/doc-api-2.webp'],
  },
  {
    title: 'Taozi Bear Card Payment System',
    summary:
      'An internal payment and financial backend for Taozi Bear Card, covering transactions, accounting, and risk workflows. Not publicly showcaseable.',
    description: [
      'A payment and financial system built for Taozi Bear Card business operations, handling fund flows and back-office management.',
      'It covers payment pipelines, accounting, and business risk controls in production. UI and data cannot be shared publicly; this entry is a project record only.',
    ],
    year: 'Long-term',
    status: 'Internal',
    tags: ['Fintech', 'Payment', 'Financial', 'Admin', 'Internal'],
    images: [],
  },
  {
    title: 'Aleta Planet Card Admin',
    summary:
      'The admin system for Aleta Planet Card—managing cards, merchants, and related business configuration for internal operations.',
    description: [
      'A card management backend for Aleta Planet Card, supporting card lifecycle, merchant information, and day-to-day operational configuration.',
      'Deployed in a restricted environment with customer and transaction data, it has no public access or portfolio screenshots—only a record of project involvement.',
    ],
    year: 'Long-term',
    status: 'Internal',
    tags: ['Card Management', 'Fintech', 'Admin', 'Operations', 'Internal'],
    images: [],
  },
  {
    title: 'CI Automation',
    summary: 'Automation for continuous integration and delivery—build, checks, and release steps wired into reusable pipelines.',
    description: [
      'Ongoing CI automation practice covering post-commit builds, quality gates, and deploy triggers to cut repetitive manual work.',
      'Pipelines standardize lint, test, and build steps so multiple projects can share the same automation flow.',
    ],
    year: 'Long-term',
    status: 'Updating',
    tags: ['CI/CD', 'GitHub Actions', 'Automation', 'DevOps'],
    images: ['/works/CI/image.webp'],
  },
  {
    title: 'WeChat Mini Programs',
    summary:
      'Three WeChat mini programs: Mashang Scorekeeper, Watermark Wallpaper Duck, and Roco Universal Assistant—for casual tools and game helpers.',
    description: [
      'Mashang Scorekeeper: A free, ad-free score tracker for mahjong nights—rooms, scoring, settlement, and history, plus small side utilities between rounds.',
      'Watermark Wallpaper Duck: Parses share links from Douyin, Xiaohongshu, WeChat articles, and more to save images and wallpapers without watermarks.',
      'Roco Universal Assistant: A helper for Roco Kingdom: World players—check traveling merchants, hatching, home bases, and player info without launching the game every time.',
    ],
    year: 'Long-term',
    status: 'Live',
    tags: ['WeChat Mini Program', 'uni-app', 'Tools', 'Game'],
    images: [
      '/works/xcx/麻将计分-0.webp',
      '/works/xcx/麻将计分-1.webp',
      '/works/xcx/去水印壁纸鸭.webp',
      '/works/xcx/洛克万能助手远行商人.webp',
    ],
  },
  {
    title: 'Personal Blog',
    summary: 'A personal site built with Next.js for publishing posts, collecting works, organizing resources, and hosting online tools.',
    description: [
      'A full-stack personal site built from scratch, supporting Markdown / Obsidian writing, post archives, resource collections, and dozens of small online tools.',
      'The site focuses on reading experience and performance, with dark mode, responsive layouts, and continuous first-screen loading optimizations.',
    ],
    year: 'Ongoing',
    status: 'Live',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Markdown'],
    href: '/',
    linkLabel: 'Open home',
    images: ['/works/blog/blog-new.webp', '/works/blog/blog-new2.webp'],
  },
];

export function getWorks(locale: Locale) {
  return locale === 'en' ? worksEn : works;
}

export function getWorksIntro(locale: Locale) {
  return locale === 'en'
    ? 'A collection of projects, products, and experiments I have built. Open an item to see the overview, screenshots, tech stack, and related links.'
    : worksIntro;
}
