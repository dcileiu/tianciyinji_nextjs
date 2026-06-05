import {
  ArrowRight,
  DatabaseZap,
  Calculator,
  ImageIcon,
  Languages,
  Network,
  Palette,
  Search,
  SquareTerminal,
  Wand2,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { getDictionary, localizedHref, type Locale } from '@/lib/i18n';

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

const MODULES_ZH: ModuleEntry[] = [
  {
    base: '/tools/local',
    href: '/tools/local' as Route,
    title: '纯本地工具',
    description: '字数统计、金额大写、正则测试、颜色、JSON、Base64、MD5 等常用小工具，全部在浏览器本地完成。',
    count: 20,
    icon: SquareTerminal,
    tools: [
      { id: 'word-count', name: '字数统计' },
      { id: 'rmb-capital', name: '金额大写' },
      { id: 'regex-tester', name: '正则测试' },
      { id: 'color-tool', name: '颜色工具' },
      { id: 'json', name: 'JSON 美化' },
      { id: 'aes', name: 'AES 加解密' },
    ],
  },
  {
    base: '/tools/image',
    href: '/tools/image' as Route,
    title: '图片处理',
    description: 'Favicon、格式转换、裁剪缩放、加水印、主色提取、二维码、压缩等，都可在浏览器本地处理。',
    count: 10,
    icon: ImageIcon,
    tools: [
      { id: 'favicon', name: 'Favicon 生成' },
      { id: 'image-convert', name: '格式转换' },
      { id: 'image-watermark', name: '加水印' },
      { id: 'color-extract', name: '主色提取' },
      { id: 'qrcode', name: '二维码生成' },
      { id: 'image-compress', name: '图片压缩' },
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
    base: '/tools/calc',
    href: '/tools/calc' as Route,
    title: '计算换算',
    description: '房贷、个税、BMI、日期间隔与常用单位换算，贴近生活与工作的实用计算器。',
    count: 5,
    icon: Calculator,
    tools: [
      { id: 'loan', name: '房贷计算' },
      { id: 'income-tax', name: '个税计算' },
      { id: 'bmi', name: 'BMI' },
      { id: 'date-diff', name: '日期间隔' },
      { id: 'unit-convert', name: '单位换算' },
    ],
  },
  {
    base: '/tools/chinese',
    href: '/tools/chinese' as Route,
    title: '中文工具',
    description: '简繁体转换、汉字转拼音与中文测试假数据生成，面向中文场景的实用工具。',
    count: 3,
    icon: Languages,
    tools: [
      { id: 'hanzi-convert', name: '简繁转换' },
      { id: 'pinyin', name: '汉字转拼音' },
      { id: 'chinese-faker', name: '中文假数据' },
    ],
  },
  {
    base: '/tools/css',
    href: '/tools/css' as Route,
    title: '前端 / CSS',
    description: 'CSS 渐变、box-shadow 阴影、圆角与调色板的可视化生成器，所见即所得并复制代码。',
    count: 4,
    icon: Palette,
    tools: [
      { id: 'css-gradient', name: 'CSS 渐变' },
      { id: 'box-shadow', name: 'box-shadow' },
      { id: 'border-radius', name: '圆角' },
      { id: 'palette', name: '调色板' },
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

const MODULES_EN: ModuleEntry[] = [
  {
    base: '/tools/local',
    href: '/tools/local' as Route,
    title: 'Local Tools',
    description: 'Word count, RMB uppercase, regex testing, color tools, JSON, Base64, MD5, and other utilities that run locally in your browser.',
    count: 20,
    icon: SquareTerminal,
    tools: [
      { id: 'word-count', name: 'Word Count' },
      { id: 'rmb-capital', name: 'RMB Uppercase' },
      { id: 'regex-tester', name: 'Regex Tester' },
      { id: 'color-tool', name: 'Color Tool' },
      { id: 'json', name: 'JSON Formatter' },
      { id: 'aes', name: 'AES Encrypt' },
    ],
  },
  {
    base: '/tools/image',
    href: '/tools/image' as Route,
    title: 'Image Tools',
    description: 'Favicon generation, format conversion, cropping, resizing, watermarking, color extraction, QR codes, and compression in the browser.',
    count: 10,
    icon: ImageIcon,
    tools: [
      { id: 'favicon', name: 'Favicon' },
      { id: 'image-convert', name: 'Convert' },
      { id: 'image-watermark', name: 'Watermark' },
      { id: 'color-extract', name: 'Extract Colors' },
      { id: 'qrcode', name: 'QR Code' },
      { id: 'image-compress', name: 'Compress' },
    ],
  },
  {
    base: '/tools/seo',
    href: '/tools/seo' as Route,
    title: 'SEO | GEO Tools',
    description: 'Optimization tools for search engines and generative AI: llms.txt, meta tags, robots.txt, structured data, keywords, and traffic analysis.',
    count: 6,
    icon: Search,
    tools: [
      { id: 'site-traffic', name: 'Traffic' },
      { id: 'llms-txt', name: 'llms.txt' },
      { id: 'meta-tags', name: 'Meta / TDK' },
      { id: 'robots-txt', name: 'robots.txt' },
      { id: 'json-ld', name: 'JSON-LD' },
      { id: 'keyword-density', name: 'Keywords' },
    ],
  },
  {
    base: '/tools/network',
    href: '/tools/network' as Route,
    title: 'Network Basics',
    description: 'Basic observation and analysis tools for URLs, domains, ports, and web page content.',
    count: 8,
    icon: Network,
    tools: [
      { id: 'dns-lookup', name: 'DNS Lookup' },
      { id: 'ping', name: 'Ping' },
      { id: 'port-scan', name: 'Port Scan' },
      { id: 'url-status', name: 'URL Status' },
      { id: 'web-markdown', name: 'Web to Markdown' },
    ],
  },
  {
    base: '/tools/calc',
    href: '/tools/calc' as Route,
    title: 'Calculators',
    description: 'Mortgage, income tax, BMI, date difference, and common unit converters for daily work and life.',
    count: 5,
    icon: Calculator,
    tools: [
      { id: 'loan', name: 'Mortgage' },
      { id: 'income-tax', name: 'Income Tax' },
      { id: 'bmi', name: 'BMI' },
      { id: 'date-diff', name: 'Date Diff' },
      { id: 'unit-convert', name: 'Unit Convert' },
    ],
  },
  {
    base: '/tools/chinese',
    href: '/tools/chinese' as Route,
    title: 'Chinese Tools',
    description: 'Simplified/traditional conversion, Chinese to pinyin, and Chinese fake data generation.',
    count: 3,
    icon: Languages,
    tools: [
      { id: 'hanzi-convert', name: 'Hanzi Convert' },
      { id: 'pinyin', name: 'Pinyin' },
      { id: 'chinese-faker', name: 'Fake Data' },
    ],
  },
  {
    base: '/tools/css',
    href: '/tools/css' as Route,
    title: 'Frontend / CSS',
    description: 'Visual generators for CSS gradients, box-shadow, border radius, and palettes with copy-ready code.',
    count: 4,
    icon: Palette,
    tools: [
      { id: 'css-gradient', name: 'CSS Gradient' },
      { id: 'box-shadow', name: 'box-shadow' },
      { id: 'border-radius', name: 'Border Radius' },
      { id: 'palette', name: 'Palette' },
    ],
  },
  {
    base: '/tools/data',
    href: '/tools/data' as Route,
    title: 'Public Data',
    description: 'Useful lookup tools built from public protocols and free data sources.',
    count: 8,
    icon: DatabaseZap,
    tools: [
      { id: 'minecraft-player', name: 'Minecraft' },
      { id: 'github-repo', name: 'GitHub Repo' },
      { id: 'gravatar', name: 'Gravatar' },
      { id: 'mobile-area', name: 'Mobile Area' },
      { id: 'bing-wallpaper', name: 'Bing Wallpaper' },
    ],
  },
];

export default function ToolsHub({ locale }: { locale: Locale }) {
  const text = getDictionary(locale).toolsHub;
  const modules = locale === 'en' ? MODULES_EN : MODULES_ZH;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-20">
      <header className="relative overflow-hidden rounded-[34px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,237,255,0.94))] px-6 py-8 shadow-[0_24px_80px_rgba(91,61,245,0.10)] sm:px-8 sm:py-10 md:px-10 md:py-12 dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(130,96,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(218,208,255,0.18),transparent_30%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7f71ab] dark:text-[#ab9cd8]">
            {text.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-[#2e2150] sm:text-4xl md:text-5xl dark:text-[#f4efff]">
            {text.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#66568f] sm:text-base dark:text-[#c4b6eb]">
            {text.description}
          </p>
        </div>
      </header>

      {/* 特色工具：去水印 */}
      <Link
        href={localizedHref('/tools/dewatermark', locale) as Route}
        className="group mt-6 block overflow-hidden rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(124,92,255,0.12),rgba(244,237,255,0.6))] p-5 shadow-[0_18px_55px_rgba(91,61,245,0.08)] transition hover:border-[#8b6bff] hover:shadow-[0_22px_70px_rgba(91,61,245,0.16)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(60,42,120,0.5),rgba(18,13,31,0.92))] sm:p-6"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#5b3df5] text-white shadow-[0_10px_30px_rgba(91,61,245,0.35)]">
            <Wand2 className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[#2e2150] dark:text-[#f4efff]">{text.featuredTitle}</h2>
              <span className="rounded-full bg-[#efe6ff] px-2 py-0.5 text-[11px] font-semibold text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#efe9ff]">
                {text.recommended}
              </span>
            </div>
            <p className="mt-1 text-sm leading-6 text-[#66568f] dark:text-[#c4b6eb]">
              {text.featuredDescription}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#8b6bff] transition group-hover:translate-x-1" />
        </div>
      </Link>

      {/* 四大模块 */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.href}
              className="group flex flex-col rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(247,242,255,0.92))] p-5 shadow-[0_22px_70px_rgba(91,61,245,0.06)] transition hover:border-[#8b6bff] hover:shadow-[0_26px_80px_rgba(91,61,245,0.14)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))] sm:p-6"
            >
              <Link href={localizedHref(module.href, locale) as Route} className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ece3ff] text-[#5b3df5] transition group-hover:scale-105 dark:bg-[#2b1f43] dark:text-[#cbbcff]">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-[#efe6ff] px-2.5 py-1 text-xs font-semibold text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#efe9ff]">
                  {text.countLabel.replace('{count}', String(module.count))}
                </span>
              </Link>

              <Link href={localizedHref(module.href, locale) as Route} className="mt-4 block">
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
                    href={`${localizedHref(module.base, locale)}?tool=${tool.id}` as Route}
                    className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1 text-xs text-[#5f4e89] transition hover:border-[#8b6bff] hover:bg-[#ece3ff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#cabbef] dark:hover:border-[#8b6bff] dark:hover:bg-[#2b1f43] dark:hover:text-[#efe9ff]"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>

              <Link
                href={localizedHref(module.href, locale) as Route}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#5b3df5] dark:text-[#cbbcff]"
              >
                {text.enterModule}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
