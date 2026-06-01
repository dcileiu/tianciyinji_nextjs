import {
  ArrowRight,
  DatabaseZap,
  ImageIcon,
  Network,
  Search,
  SquareTerminal,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';

interface ToolChip {
  id: string;
  name: string;
}

interface ModuleEntry {
  base: string;
  href: Route;
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
  tools: ToolChip[];
}

const MODULES: ModuleEntry[] = [
  {
    base: '/tools/local',
    href: '/tools/local' as Route,
    title: '纯本地工具',
    description: '不依赖外部网络，浏览器或本站服务端本地就能完成的算法和文本处理工具。',
    count: 9,
    icon: SquareTerminal,
    tools: [
      { id: 'aes', name: 'AES 加解密' },
      { id: 'base64', name: 'Base64' },
      { id: 'md5', name: 'MD5' },
      { id: 'json', name: 'JSON 美化' },
      { id: 'timestamp', name: '时间戳' },
      { id: 'code-obfuscate', name: '代码混淆' },
    ],
  },
  {
    base: '/tools/image',
    href: '/tools/image' as Route,
    title: '图片处理',
    description: '二维码、Base64、SVG、压缩和简版摸头 GIF，都可以直接在页面里处理。',
    count: 5,
    icon: ImageIcon,
    tools: [
      { id: 'qrcode', name: '二维码生成' },
      { id: 'image-base64', name: '图片转 Base64' },
      { id: 'svg-image', name: 'SVG 转图片' },
      { id: 'image-compress', name: '图片压缩' },
      { id: 'pet-gif', name: '摸头 GIF' },
    ],
  },
  {
    base: '/tools/seo',
    href: '/tools/seo' as Route,
    title: 'SEO | GEO 工具',
    description: '面向搜索引擎与生成式 AI 的优化工具：llms.txt、Meta 标签、robots.txt、结构化数据、关键词密度与网站流量分析。',
    count: 6,
    icon: Search,
    tools: [
      { id: 'site-traffic', name: '网站流量分析' },
      { id: 'llms-txt', name: 'llms.txt' },
      { id: 'meta-tags', name: 'Meta / TDK' },
      { id: 'robots-txt', name: 'robots.txt' },
      { id: 'json-ld', name: 'JSON-LD' },
      { id: 'keyword-density', name: '关键词密度' },
    ],
  },
  {
    base: '/tools/network',
    href: '/tools/network' as Route,
    title: '网络基础',
    description: '面向 URL、域名、端口和网页内容的基础观测与分析能力。',
    count: 8,
    icon: Network,
    tools: [
      { id: 'dns-lookup', name: 'DNS 查询' },
      { id: 'ping', name: 'Ping' },
      { id: 'port-scan', name: '端口扫描' },
      { id: 'url-status', name: 'URL 状态' },
      { id: 'web-markdown', name: '网页转 Markdown' },
    ],
  },
  {
    base: '/tools/data',
    href: '/tools/data' as Route,
    title: '公开数据',
    description: '基于公开协议或免费数据源组合出来的实用信息查询工具。',
    count: 8,
    icon: DatabaseZap,
    tools: [
      { id: 'minecraft-player', name: 'Minecraft 信息' },
      { id: 'github-repo', name: 'GitHub 仓库' },
      { id: 'gravatar', name: 'Gravatar' },
      { id: 'mobile-area', name: '手机号归属' },
      { id: 'bing-wallpaper', name: 'Bing 壁纸' },
    ],
  },
];

export default function ToolsHub() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-20">
      <header className="relative overflow-hidden rounded-[34px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,237,255,0.94))] px-6 py-8 shadow-[0_24px_80px_rgba(91,61,245,0.10)] sm:px-8 sm:py-10 md:px-10 md:py-12 dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(130,96,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(218,208,255,0.18),transparent_30%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7f71ab] dark:text-[#ab9cd8]">
            Tools Menu
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-[#2e2150] sm:text-4xl md:text-5xl dark:text-[#f4efff]">
            工具菜单
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#66568f] sm:text-base dark:text-[#c4b6eb]">
            这里把纯本地算法、图片处理、网络基础探测和公开数据接口分成了四大模块，外加一个去水印工具。选一个模块进入，里面是对应的工具卡片。
          </p>
        </div>
      </header>

      {/* 特色工具：去水印 */}
      <Link
        href={'/tools/dewatermark' as Route}
        className="group mt-6 block overflow-hidden rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(124,92,255,0.12),rgba(244,237,255,0.6))] p-5 shadow-[0_18px_55px_rgba(91,61,245,0.08)] transition hover:border-[#8b6bff] hover:shadow-[0_22px_70px_rgba(91,61,245,0.16)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(60,42,120,0.5),rgba(18,13,31,0.92))] sm:p-6"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#5b3df5] text-white shadow-[0_10px_30px_rgba(91,61,245,0.35)]">
            <Wand2 className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#2e2150] dark:text-[#f4efff]">去水印</h2>
              <span className="rounded-full bg-[#efe6ff] px-2 py-0.5 text-[11px] font-semibold text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#efe9ff]">
                推荐
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-[#66568f] dark:text-[#c4b6eb]">
              公众号 / 抖音 / 小红书分享链接一键解析，返回无水印图片与视频资源。
            </p>
          </div>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#8b6bff] transition group-hover:translate-x-1" />
        </div>
      </Link>

      {/* 四大模块 */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.href}
              className="group flex flex-col rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(247,242,255,0.92))] p-5 shadow-[0_22px_70px_rgba(91,61,245,0.06)] transition hover:border-[#8b6bff] hover:shadow-[0_26px_80px_rgba(91,61,245,0.14)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))] sm:p-6"
            >
              <Link href={module.href} className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ece3ff] text-[#5b3df5] transition group-hover:scale-105 dark:bg-[#2b1f43] dark:text-[#cbbcff]">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-[#efe6ff] px-2.5 py-1 text-xs font-semibold text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#efe9ff]">
                  {module.count} 个工具
                </span>
              </Link>

              <Link href={module.href} className="mt-4 block">
                <h2 className="text-xl font-semibold tracking-tight text-[#2e2150] transition group-hover:text-[#4f31d7] dark:text-[#f4efff] dark:group-hover:text-[#cbbcff]">
                  {module.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[#66568f] dark:text-[#c4b6eb]">
                  {module.description}
                </p>
              </Link>

              <div className="mt-4 flex flex-1 flex-wrap content-start gap-2">
                {module.tools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`${module.base}?tool=${tool.id}` as Route}
                    className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1 text-xs text-[#5f4e89] transition hover:border-[#8b6bff] hover:bg-[#ece3ff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#cabbef] dark:hover:border-[#8b6bff] dark:hover:bg-[#2b1f43] dark:hover:text-[#efe9ff]"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>

              <Link
                href={module.href}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#5b3df5] dark:text-[#cbbcff]"
              >
                进入模块
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
