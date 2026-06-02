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
    // 示例：把截图放进 public/works/blog/ 后填入路径
    // images: ['/works/blog/1.png', '/works/blog/2.png'],
    images: [],
    featured: true,
  },
  {
    title: '作品展示页',
    summary: '网页设计、产品案例与视觉探索的合集，持续补充中。',
    year: '待补充',
    status: '准备中',
    tags: ['Portfolio', 'UI', 'Motion'],
    images: [],
  },
  {
    title: 'Side Project',
    summary: '开源工具、自动化脚本与 AI 小实验等长期维护的项目。',
    year: '长期维护',
    status: '持续更新',
    tags: ['Open Source', 'Automation', 'AI'],
    images: [],
  },
];
