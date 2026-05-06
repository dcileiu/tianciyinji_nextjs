import type { NavItem } from './types';

type StarterWork = {
  title: string;
  summary: string;
  year: string;
  status: string;
  tags: string[];
  href?: string;
};

// Edit this file first when you want to customize the site's identity.
export const siteConfig = {
  name: '天赐',
  title: '天赐印记',
  description: '记录博客、作品、资源与一些长期主义的尝试。',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  avatar: '/content/site/avatar.svg',
  email: 'dcileiu@outlook.com',
  tagline: '写作、项目与一些正在发生的事',
  role: '全栈开发者 / 写作者',
  location: '广东深圳',
  githubUsername: 'tianci',
  socials: {
    github: '',
    email: 'mailto:dcileiu@outlook.com',
    rss: '/rss',
  },
  home: {
    eyebrow: '个人网站',
    title: '记录博客、作品、资源与一些长期主义的尝试。',
    intro: '这里是我的个人站，用来发布文章、整理作品、沉淀资源，也公开一些正在进行中的想法与实验。欢迎访问，也欢迎留言。',
  },
  about: {
    intro:
      '我希望把这里做成一个长期更新的公开工作台。博客负责沉淀思考，作品页负责展示项目，资源页负责整理那些值得反复使用的内容。',
    focus: ['技术文章与工作笔记', '个人项目与产品实验', '设计截图、灵感与过程记录', '可以复用的模板、清单和资源'],
    techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Vue', 'uni-app', 'Python', 'AI Tools'],
    contactText: '如果你想聊合作、交流技术，或者只是打个招呼，都可以通过邮箱或 GitHub 找到我。',
  },
  works: {
    intro: '这里先保留一个轻量作品陈列模板。你后面只需要替换成自己的项目、链接和图片，就能很快整理出一页像样的作品集。',
    items: [
      {
        title: '个人博客',
        summary: '用来发布文章、记录项目更新和持续写作。',
        year: '进行中',
        status: '已上线',
        tags: ['Next.js', 'Markdown', 'Tailwind CSS'],
        href: '/',
      },
      {
        title: '作品展示页',
        summary: '适合放网页设计、产品案例、视觉探索或截图合集。',
        year: '待补充',
        status: '准备中',
        tags: ['Portfolio', 'UI', 'Motion'],
      },
      {
        title: 'Side Project',
        summary: '适合整理开源工具、自动化脚本、AI 小实验和长期维护的项目。',
        year: '长期维护',
        status: '持续更新',
        tags: ['Open Source', 'Automation', 'AI'],
      },
    ] as StarterWork[],
  },
} as const;

export const siteKeywords = ['天赐印记','个人站', '博客', '作品集', 'Next.js', 'Markdown', 'Vue', 'uni-app', 'Python', 'AI Tools'];

export const primaryNavItems: NavItem[] = [
  { label: '首页', href: '/', enabled: true },
  { label: '归档', href: '/archive', enabled: true },
  { label: '作品', href: '/works', enabled: true },
  { label: '资源', href: '/resources', enabled: true },
  { label: '关于', href: '/about', enabled: true },
];

export const hasGithubProfile = siteConfig.githubUsername.trim().length > 0;

export function pageTitle(title: string) {
  return `${title} - ${siteConfig.name}`;
}

export function absoluteUrl(path = '/') {
  return new URL(path, siteConfig.url).toString();
}
