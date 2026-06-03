import type { NavItem } from './types';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const locales = ['zh-CN', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'zh-CN';

export function normalizeLocale(value?: string | null): Locale {
  return value === 'en' ? 'en' : defaultLocale;
}

export function stripLocalePrefix(pathname: string) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

export function getPathLocale(pathname: string) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : defaultLocale;
}

export function localizePath(pathname: string, locale: Locale) {
  const cleanPath = stripLocalePrefix(pathname);
  if (locale === defaultLocale) return cleanPath;
  return cleanPath === '/' ? '/en' : `/en${cleanPath}`;
}

export function localizedHref(href: string, locale: Locale) {
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  return localizePath(href, locale);
}

const common = {
  name: 'Dci',
  title: 'Dci',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://itianci.cn',
  avatar: '/avatar/avatar.webp',
  email: 'dcileiu@outlook.com',
  githubUsername: 'tianci',
  socials: {
    github: 'https://github.com/dcileiu',
    email: 'mailto:dcileiu@outlook.com',
    rss: '/rss',
  },
} as const;

export const dictionaries = {
  'zh-CN': {
    language: 'zh-CN',
    locale: 'zh_CN',
    site: {
      ...common,
      description: '记录博客、作品、资源与一些长期主义的尝试',
      tagline: '写作、项目与一些正在发生的事。',
      role: '全栈开发 / 小程序',
      location: '广东深圳',
    },
    nav: [
      { label: '首页', href: '/', enabled: true },
      { label: '归档', href: '/archive', enabled: true },
      { label: '作品', href: '/works', enabled: true },
      {
        label: '工具',
        href: '/tools',
        enabled: true,
        children: [
          { label: '去水印', href: '/tools/dewatermark', enabled: true },
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
      { label: '关于', href: '/about', enabled: true },
    ] satisfies NavItem[],
    header: {
      ariaLabel: '全局顶部导航',
      openSidebar: '打开侧边栏',
      closeSidebar: '关闭侧边栏',
      search: '搜索',
      language: 'Switch to English',
    },
    sidebar: {
      ariaLabel: '侧边导航',
      closeMenu: '关闭菜单',
      collapseSubmenu: '收起{label}子菜单',
      expandSubmenu: '展开{label}子菜单',
    },
    home: {
      eyebrow: "Liu Dci's Blog",
      titleLines: ['全栈开发一枚', '记录博客、作品、资源与一些长期主义的尝试'],
      intro:
        '这里是我的个人站点，用来发布文章、整理作品、沉淀资源、小工具，也公开一些正在进行中的想法与实验。',
      actions: {
        about: '了解我',
        works: '查看作品',
        resources: '浏览资源',
        tools: '实用工具',
      },
      latestTitle: '最近更新',
      latestDescription: '最新发布的文章会出现在这里。',
      readArticle: '阅读文章',
      blogFallback: '博客',
      viewAll: '查看全部 ->',
    },
    about: {
      metadataTitle: '关于',
      metadataKeywords: ['关于我', '个人介绍', '技术栈', '联系方式'],
      intro:
        '我希望把这里做成一个长期更新的公开工作台。博客负责沉淀思考，作品页负责展示项目，资源页负责整理那些值得反复使用的内容。',
      focusTitle: '这个站点会放什么',
      focus: ['技术文章与工作笔记', '个人项目与产品实验', '设计截图、灵感与过程记录', '可以复用的模板、清单和资源'],
      techTitle: '常用技术',
      contactTitle: '联系我',
      contactText: '如果你想聊合作、交流技术，或者只是打个招呼，都可以通过邮箱或 GitHub 找到我。',
      emailAction: '发邮件',
      forks: '项目 Forks',
      contributions: '近一年贡献',
      breadcrumbs: {
        home: '首页',
        about: '关于',
      },
    },
    works: {
      metadataTitle: '作品',
      metadataDescription: '我做过的项目、案例与长期维护中的作品集，含项目截图、技术栈与相关链接。',
      metadataKeywords: ['作品集', '项目展示', '案例', '截图'],
      title: '作品',
      intro: '这里收录我做过的项目、产品与实验，点开可以查看简介、截图、用到的技术和相关链接。',
      linkFallback: '查看作品',
    },
    archive: {
      metadataTitle: '归档',
      metadataDescription: '按时间整理的博客文章与更新记录。',
      metadataKeywords: ['文章归档', '博客归档', '时间线'],
      title: '归档',
      stats: '今年我写了 {count} 篇文章，一共 {words} 字',
      empty: '该分类下暂无文章',
      all: '全部',
    },
    resources: {
      metadataTitle: '资源',
      metadataDescription: '集中整理模板、清单和可以重复使用的内容。',
      metadataKeywords: ['资源库', '模板', '清单', '下载'],
      title: '资源',
      description: '整理的实用资源和数据集，全部免费开放使用。',
      tabs: { resources: '资源', commands: '命令', design: '设计' },
      emptyResources: '暂无资源',
      emptyResourcesDescription: '资源正在持续整理中，欢迎稍后再来看看。',
      emptyCategory: '{category} 下暂无资源',
      emptyCategoryDescription: '换个分类看看，或稍后再来。',
      fileSize: '文件大小',
      updatedAt: '更新时间',
      viewDetails: '查看详情',
      download: '下载资源',
      emptyCommands: '暂无收藏的命令',
      copied: '已复制',
      copy: '复制',
      emptyDesign: '暂无设计组件',
      noPreview: '无预览',
      copyCode: '复制代码',
      all: '全部',
    },
    toolsHub: {
      metadataTitle: '在线工具箱：llms.txt 生成器、代码混淆压缩、AES、Base64、MD5、JSON、二维码',
      metadataDescription:
        '免费在线工具聚合页，提供 llms.txt 生成器、代码混淆与压缩、AES 加解密、Base64 编解码、MD5 计算与校验、随机数与随机字符串、时间戳转换、JSON 美化与压缩、参数分析、敏感词快速检测、二维码生成、图片与 Base64 互转、SVG 转图片、图片压缩、摸头 GIF、客户端 IP、DNS 查询、Ping、端口扫描、URL 状态检测、网页元数据提取、网页图片提取、网页转 Markdown、Minecraft 玩家与服务器信息、GitHub 仓库信息、Gravatar、基础 IP 归属、手机号归属地、Bing 每日壁纸、答案之书、诗词与历史今天等工具。',
      metadataKeywords: ['在线工具箱', 'llms.txt 生成器', 'AES 加解密', 'Base64 编解码', 'MD5 计算', 'JSON 美化', '二维码生成'],
      eyebrow: 'Tools Menu',
      title: '工具菜单',
      description:
        '免费在线工具箱，涵盖文本与编码、图片处理、SEO / GEO、网络查询、计算换算、中文工具与去水印等。多数工具在浏览器本地完成，安全不上传，点选下方分类即可使用。',
      featuredTitle: '去水印',
      recommended: '推荐',
      featuredDescription: '公众号 / 抖音 / 小红书分享链接一键解析，返回无水印图片与视频资源。',
      countLabel: '{count} 个工具',
      enterModule: '进入模块',
    },
    privacy: {
      metadataTitle: '隐私政策',
      metadataDescription: '关于站点如何处理访问数据和联系信息的简要说明。',
      metadataKeywords: ['隐私政策', '数据处理', 'Cookie'],
      title: '隐私政策',
      updated: '最后更新：2026-05-06',
      sections: [
        ['基础说明', '这是一个个人站点，主要用于发布博客、展示作品和整理资源。站点不会主动收集与你身份直接相关的敏感信息，也不会把你的数据出售给第三方。'],
        ['访问数据', '和大多数网站一样，服务器可能会记录基础访问数据，例如访问时间、请求路径、浏览器类型和 IP 地址。这些信息仅用于排查问题、了解访问情况和优化站点体验。'],
        ['本地存储与偏好', '为了记住主题、布局、语言和侧边栏等界面偏好，站点会在你的浏览器本地存储少量配置。这些内容仅保存在你的设备中，用于改善浏览体验。'],
        ['第三方服务', '某些页面可能会使用第三方资源，例如图片、字体、代码仓库数据或外部链接预览。当你访问这些内容时，相关服务提供方可能会按照它们自己的隐私政策处理请求数据。'],
      ],
      contactTitle: '联系我',
      contactText: '如果你通过邮件联系我，我只会将这些信息用于回复你的问题或继续沟通，不会用于营销或向第三方披露。',
      email: '邮箱',
    },
    pricing: {
      metadataTitle: '合作咨询',
      metadataDescription: '如果你想聊项目合作、网站搭建或内容定制，可以从这里联系我。',
      metadataKeywords: ['合作咨询', '项目合作', '网站搭建', '内容定制'],
      title: '合作咨询',
      description: '如果你想聊网站搭建、项目开发、设计支持或内容合作，欢迎通过下面的方式联系我，我会尽快回复并一起确认需求与方案。',
      sectionTitle: '合作方式',
      sectionText: '目前以邮件沟通为主：说明你的项目背景、想实现的目标和大致时间，我会结合需求给出可行方案与报价建议。',
      emailAction: '发邮件联系',
      githubAction: '查看 GitHub',
    },
    search: {
      metadataTitle: '搜索',
      metadataDescription: '站内文章搜索页。',
      metadataKeywords: ['站内搜索'],
    },
    friends: {
      metadataTitle: '友链',
      metadataDescription: '朋友站点、创作者主页与我常逛的实用网站，例如刘明野的工具箱（tools.liumingye.cn）。',
      metadataKeywords: ['友链', '友情链接', '创作者推荐', '刘明野', '刘明野的工具箱', 'tools.liumingye.cn'],
      title: '友链',
      items: [{ name: '刘明野的工具箱', description: '好用、易用的在线工具与站点导航，内容持续扩充。' }],
    },
    media: {
      music: {
        metadataTitle: '音乐',
        metadataDescription: '我正在听的歌单与音乐收藏。',
        metadataKeywords: ['音乐', '歌单', '音乐收藏'],
        title: '音乐',
        description: '听歌吗？每日更新。',
      },
      games: {
        metadataTitle: '游戏',
        metadataDescription: '我喜欢的游戏、体验片段与推荐理由。',
        metadataKeywords: ['游戏推荐', '游戏收藏', 'Steam 游戏'],
      },
      designs: {
        metadataTitle: '设计',
        metadataDescription: '设计截图、灵感图集与视觉收藏。',
        metadataKeywords: ['设计灵感', '视觉设计', '设计截图'],
      },
    },
  },
  en: {
    language: 'en',
    locale: 'en_US',
    site: {
      ...common,
      description: 'A personal space for writing, projects, resources, and long-term experiments.',
      tagline: 'Writing, projects, and a few things in progress.',
      role: 'Full-stack Developer / Mini Program Builder',
      location: 'Shenzhen, Guangdong',
    },
    nav: [
      { label: 'Home', href: '/', enabled: true },
      { label: 'Archive', href: '/archive', enabled: true },
      { label: 'Works', href: '/works', enabled: true },
      {
        label: 'Tools',
        href: '/tools',
        enabled: true,
        children: [
          { label: 'Dewatermark', href: '/tools/dewatermark', enabled: true },
          { label: 'SEO | GEO Tools', href: '/tools/seo', enabled: true },
          { label: 'Local Tools', href: '/tools/local', enabled: true },
          { label: 'Image Tools', href: '/tools/image', enabled: true },
          { label: 'Calculators', href: '/tools/calc', enabled: true },
          { label: 'Chinese Tools', href: '/tools/chinese', enabled: true },
          { label: 'Frontend / CSS', href: '/tools/css', enabled: true },
          { label: 'Network Basics', href: '/tools/network', enabled: true },
          { label: 'Public Data', href: '/tools/data', enabled: true },
        ],
      },
      { label: 'Resources', href: '/resources', enabled: true },
      { label: 'About', href: '/about', enabled: true },
    ] satisfies NavItem[],
    header: {
      ariaLabel: 'Global navigation',
      openSidebar: 'Open sidebar',
      closeSidebar: 'Close sidebar',
      search: 'Search',
      language: '切换到中文',
    },
    sidebar: {
      ariaLabel: 'Sidebar navigation',
      closeMenu: 'Close menu',
      collapseSubmenu: 'Collapse {label} submenu',
      expandSubmenu: 'Expand {label} submenu',
    },
    home: {
      eyebrow: "Liu Dci's Blog",
      titleLines: ['Full-stack developer', 'Writing about code, projects, resources, and long-term practice'],
      intro:
        'This is my personal site for publishing essays, collecting projects, organizing resources and small tools, and sharing ideas that are still taking shape.',
      actions: {
        about: 'About me',
        works: 'View works',
        resources: 'Browse resources',
        tools: 'Useful tools',
      },
      latestTitle: 'Latest Updates',
      latestDescription: 'Recently published posts will appear here.',
      readArticle: 'Read article',
      blogFallback: 'Blog',
      viewAll: 'View all ->',
    },
    about: {
      metadataTitle: 'About',
      metadataKeywords: ['About me', 'Profile', 'Tech stack', 'Contact'],
      intro:
        'I want this site to become a long-running public workbench: the blog holds thinking, the works page shows projects, and the resources page collects materials worth revisiting.',
      focusTitle: 'What this site is for',
      focus: ['Technical essays and work notes', 'Personal projects and product experiments', 'Design screenshots, inspiration, and process notes', 'Reusable templates, checklists, and resources'],
      techTitle: 'Common Stack',
      contactTitle: 'Contact',
      contactText: 'If you want to talk collaboration, exchange technical ideas, or simply say hello, you can reach me by email or GitHub.',
      emailAction: 'Email me',
      forks: 'Project Forks',
      contributions: 'Contributions this year',
      breadcrumbs: {
        home: 'Home',
        about: 'About',
      },
    },
    works: {
      metadataTitle: 'Works',
      metadataDescription: 'Projects, case studies, and long-running works with screenshots, tech stacks, and related links.',
      metadataKeywords: ['Portfolio', 'Projects', 'Case studies', 'Screenshots'],
      title: 'Works',
      intro:
        'A collection of projects, products, and experiments I have built. Open an item to see the overview, screenshots, tech stack, and related links.',
      linkFallback: 'View work',
    },
    archive: {
      metadataTitle: 'Archive',
      metadataDescription: 'Blog posts and update history organized by time.',
      metadataKeywords: ['Archive', 'Blog archive', 'Timeline'],
      title: 'Archive',
      stats: 'I wrote {count} posts this year, totaling {words} words',
      empty: 'No posts in this category yet',
      all: 'All',
    },
    resources: {
      metadataTitle: 'Resources',
      metadataDescription: 'Templates, checklists, and reusable materials collected in one place.',
      metadataKeywords: ['Resources', 'Templates', 'Checklists', 'Downloads'],
      title: 'Resources',
      description: 'Practical resources and datasets, all free to use.',
      tabs: { resources: 'Resources', commands: 'Commands', design: 'Design' },
      emptyResources: 'No resources yet',
      emptyResourcesDescription: 'Resources are being organized. Please check back later.',
      emptyCategory: 'No resources under {category}',
      emptyCategoryDescription: 'Try another category or come back later.',
      fileSize: 'File size',
      updatedAt: 'Updated',
      viewDetails: 'View details',
      download: 'Download',
      emptyCommands: 'No saved commands yet',
      copied: 'Copied',
      copy: 'Copy',
      emptyDesign: 'No design components yet',
      noPreview: 'No preview',
      copyCode: 'Copy code',
      all: 'All',
    },
    toolsHub: {
      metadataTitle: 'Online Toolkit: llms.txt Generator, Code Minifier, AES, Base64, MD5, JSON, QR Code',
      metadataDescription:
        'A free online toolkit covering llms.txt generation, code minification and obfuscation, AES encryption, Base64, MD5, random strings, timestamps, JSON formatting, QR codes, image utilities, network checks, metadata extraction, Minecraft, GitHub, Gravatar, IP lookup, Bing wallpaper, and more.',
      metadataKeywords: ['Online tools', 'llms.txt generator', 'AES encryption', 'Base64', 'MD5', 'JSON formatter', 'QR code generator'],
      eyebrow: 'Tools Menu',
      title: 'Tools Menu',
      description:
        'A free toolbox for text and encoding, image processing, SEO / GEO, network checks, calculators, Chinese utilities, and dewatermarking. Most tools run locally in your browser.',
      featuredTitle: 'Dewatermark',
      recommended: 'Recommended',
      featuredDescription: 'Parse WeChat Official Account, Douyin, and Xiaohongshu share links to retrieve clean image and video resources.',
      countLabel: '{count} tools',
      enterModule: 'Open module',
    },
    privacy: {
      metadataTitle: 'Privacy Policy',
      metadataDescription: 'A short note about how this site handles visit data and contact information.',
      metadataKeywords: ['Privacy Policy', 'Data handling', 'Cookie'],
      title: 'Privacy Policy',
      updated: 'Last updated: 2026-05-06',
      sections: [
        ['Basics', 'This is a personal site for publishing posts, showing works, and organizing resources. It does not actively collect sensitive identity-related information or sell your data to third parties.'],
        ['Visit Data', 'Like most websites, the server may record basic visit data such as access time, request path, browser type, and IP address. This is used only for troubleshooting, understanding traffic, and improving the experience.'],
        ['Local Storage and Preferences', 'To remember interface preferences such as theme, layout, language, and sidebar state, the site stores a small amount of configuration locally in your browser. These values stay on your device.'],
        ['Third-party Services', 'Some pages may use third-party resources such as images, fonts, repository data, or external link previews. Those providers may process request data according to their own privacy policies.'],
      ],
      contactTitle: 'Contact',
      contactText: 'If you contact me by email, I will use that information only to reply or continue the conversation. It will not be used for marketing or disclosed to third parties.',
      email: 'Email',
    },
    pricing: {
      metadataTitle: 'Collaboration',
      metadataDescription: 'Contact me about project collaboration, website building, or content customization.',
      metadataKeywords: ['Collaboration', 'Project work', 'Website building', 'Content customization'],
      title: 'Collaboration',
      description: 'If you want to discuss website building, project development, design support, or content collaboration, feel free to contact me. I will reply as soon as possible and help clarify the scope and plan.',
      sectionTitle: 'How to collaborate',
      sectionText: 'Email is the preferred channel for now. Share your project background, goals, and rough timeline, and I will suggest a feasible plan and pricing direction.',
      emailAction: 'Email me',
      githubAction: 'View GitHub',
    },
    search: {
      metadataTitle: 'Search',
      metadataDescription: 'Search posts inside this site.',
      metadataKeywords: ['Site search'],
    },
    friends: {
      metadataTitle: 'Friends',
      metadataDescription: 'Friend sites, creator homepages, and practical websites I often visit, such as Liu Mingye Tools (tools.liumingye.cn).',
      metadataKeywords: ['Friends', 'Links', 'Creator recommendations', 'Liu Mingye', 'tools.liumingye.cn'],
      title: 'Friends',
      items: [{ name: 'Liu Mingye Tools', description: 'A practical and easy-to-use online toolbox and site directory that keeps growing.' }],
    },
    media: {
      music: {
        metadataTitle: 'Music',
        metadataDescription: 'A playlist and music collection I am listening to.',
        metadataKeywords: ['Music', 'Playlist', 'Music collection'],
        title: 'Music',
        description: 'Want to listen? Updated daily.',
      },
      games: {
        metadataTitle: 'Games',
        metadataDescription: 'Games I like, gameplay moments, and personal recommendations.',
        metadataKeywords: ['Game recommendations', 'Game collection', 'Steam games'],
      },
      designs: {
        metadataTitle: 'Design',
        metadataDescription: 'Design screenshots, visual references, and inspiration boards.',
        metadataKeywords: ['Design inspiration', 'Visual design', 'Design screenshots'],
      },
    },
  },
} as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getLocalizedSiteConfig(locale: Locale) {
  const dictionary = getDictionary(locale);

  return {
    ...dictionary.site,
    language: dictionary.language,
    locale: dictionary.locale,
    home: {
      eyebrow: dictionary.home.eyebrow,
      title: dictionary.site.description,
      intro: dictionary.home.intro,
    },
    about: {
      intro: dictionary.about.intro,
      focus: dictionary.about.focus,
      techStack: ['TypeScript', 'React', 'Next.js', 'Node.js', 'Tailwind CSS', 'Vue', 'uni-app', 'Python', 'AI Tools'],
      contactText: dictionary.about.contactText,
    },
  };
}
