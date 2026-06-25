import type { NavItem } from './types';

// Edit this file first when you want to customize the site's identity.
export const siteConfig = {
  name: '刘典赐的工具箱',
  title: '刘典赐的工具箱',
  description: '记录博客、作品、资源与一些长期主义的尝试',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://itianci.cn',
  language: 'zh-CN',
  locale: 'zh_CN',
  avatar: '/avatar/avatar.webp',
  email: 'dcileiu@outlook.com',
  tagline: '写作、项目与一些正在发生的事。',
  role: '全栈开发 / 小程序',
  location: '广东深圳',
  githubUsername: 'tianci',
  socials: {
    github: 'https://github.com/dcileiu',
    email: 'mailto:dcileiu@outlook.com',
    rss: '/rss',
  },
  home: {
    eyebrow: '刘典赐的工具箱',
    title: '记录博客、作品、资源与一些长期主义的尝试',
    intro:
      '这里是我的个人站点，用来发布文章、整理作品、沉淀资源、小工具，也公开一些正在进行中的想法与实验。',
  },
  about: {
    intro:
      '我希望把这里做成一个长期更新的公开工作台。博客负责沉淀思考，作品页负责展示项目，资源页负责整理那些值得反复使用的内容。',
    focus: ['技术文章与工作笔记', '个人项目与产品实验', '设计截图、灵感与过程记录', '可以复用的模板、清单和资源'],
    techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Vue', 'uni-app', 'Python', 'AI Tools'],
    contactText: '如果你想聊合作、交流技术，或者只是打个招呼，都可以通过邮箱或 GitHub 找到我。',
  },
} as const;

export const siteKeywords = ['Dci', '个人站', '博客', '作品集', 'Next.js', 'Markdown', 'Vue', 'uni-app', 'Python', 'AI Tools'];

export const dewatermarkToolUrl = 'https://removewatermark.itianci.cn/' as const;

export const primaryNavItems: NavItem[] = [
  { label: '首页', href: '/', enabled: true },
  { label: '归档', href: '/archive', enabled: true },
  { label: '作品', href: '/works', enabled: true },
  {
    label: '工具',
    href: '/tools',
    enabled: true,
    children: [
      { label: '去水印', href: dewatermarkToolUrl, enabled: true },
      { label: 'SEO | GEO 工具', href: '/tools/seo', enabled: true },
      { label: '纯本地工具', href: '/tools/local', enabled: true },
      { label: '图片处理', href: '/tools/image', enabled: true },
      { label: '计算换算', href: '/tools/calc', enabled: true },
      { label: '中文工具', href: '/tools/chinese', enabled: true },
      { label: '前端 / CSS', href: '/tools/css', enabled: true },
      { label: '网络基础', href: '/tools/network', enabled: true },
      { label: '公开数据', href: '/tools/data', enabled: true },
    ],
  },
  { label: '资源', href: '/resources', enabled: true },
  { label: '友链', href: '/friends', enabled: true },
  { label: '关于', href: '/about', enabled: true },
];

export const hasGithubProfile = siteConfig.githubUsername.trim().length > 0;

export const localizedSiteNames = {
  'zh-CN': siteConfig.name,
  en: "Tianci's Toolbox",
} as const;

export type SiteNameLocale = keyof typeof localizedSiteNames;

export function pageTitle(title: string, locale: SiteNameLocale = 'zh-CN') {
  return `${title} - ${localizedSiteNames[locale]}`;
}

export function localizePageTitle(title: string, locale: SiteNameLocale = 'zh-CN') {
  const nextName = localizedSiteNames[locale];
  for (const name of Object.values(localizedSiteNames)) {
    const suffix = ` - ${name}`;
    if (title.endsWith(suffix)) return `${title.slice(0, -suffix.length)} - ${nextName}`;
  }
  return title;
}

export function absoluteUrl(path = '/') {
  return new URL(path, siteConfig.url).toString();
}
