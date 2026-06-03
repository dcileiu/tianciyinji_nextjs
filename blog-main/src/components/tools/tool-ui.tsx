'use client';

import { Check, ChevronDown, Upload } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type ChangeEvent, type ReactNode, useRef, useState } from 'react';
import { SimpleDropdown, SimpleDropdownItem } from '@/components/ui/simple-dropdown';
import { getPathLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useTranslation } from './TranslationContext';

export const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] dark:placeholder:text-[#ae9fda] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff]';

export const cardClass =
  'rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(247,242,255,0.92))] p-5 shadow-[0_22px_70px_rgba(91,61,245,0.08)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]';

export const outputClass =
  'rounded-2xl border border-dashed border-[#d9ccff] bg-[#faf7ff] px-4 py-3 text-sm text-[#4d3f77] dark:border-[#3b2f59] dark:bg-[#181127] dark:text-[#d9ccff]';

export const secondaryButtonClass =
  'rounded-full border-[#b9a3ff] bg-[#f7f1ff] text-[#4b2fd0] shadow-[0_12px_32px_rgba(91,61,245,0.12)] hover:border-[#8b6bff] hover:bg-[#eee3ff] hover:text-[#3c22c3] dark:border-[#5a4492] dark:bg-[#1d1533] dark:text-[#efe9ff] dark:hover:border-[#8b6bff] dark:hover:bg-[#291e45]';

const sectionCardEn: Record<string, { title: string; description: string }> = {
  字数统计: { title: 'Word Count', description: 'Count characters, words, punctuation, lines, and paragraphs in real time.' },
  人民币金额大写: { title: 'RMB Uppercase', description: 'Convert numeric amounts into formal Chinese RMB uppercase text.' },
  正则表达式测试: { title: 'Regex Tester', description: 'Test regular expressions with common flags and preview matches instantly.' },
  '颜色工具 / 渐变': { title: 'Color Tool / Gradient', description: 'Convert HEX, RGB, and HSL, check contrast, and generate CSS gradients.' },
  'JSON ↔ CSV 互转': { title: 'JSON <-> CSV', description: 'Convert JSON arrays and CSV tables for import, export, and data cleanup.' },
  'JWT 解码': { title: 'JWT Decode', description: 'Decode JWT headers and payloads, with issued and expiry times shown clearly.' },
  'Cron 表达式解析': { title: 'Cron Parser', description: 'Parse standard five-field cron expressions and preview upcoming runs.' },
  'SHA 哈希': { title: 'SHA Hash', description: 'Compute SHA-1, SHA-256, SHA-384, and SHA-512 locally with Web Crypto.' },
  进制转换: { title: 'Base Conversion', description: 'Convert binary, octal, decimal, hex, and bases from 2 to 36 using BigInt.' },
  '文本 Diff 对比': { title: 'Text Diff', description: 'Compare two text blocks line by line and highlight added or removed lines.' },
  '命名 / 大小写转换': { title: 'Case Conversion', description: 'Convert between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and Title Case.' },
  'AES 加解密': { title: 'AES Encrypt / Decrypt', description: 'Encrypt and decrypt with AES-GCM locally in the browser.' },
  'Base64 编解码': { title: 'Base64 Encode / Decode', description: 'Safely encode and decode Unicode text for API and parameter testing.' },
  'MD5 计算与校验': { title: 'MD5 Calculate / Verify', description: 'Calculate MD5 and compare it with an expected hash.' },
  '随机数 / 随机字符串': { title: 'Random Number / String', description: 'Generate random test values with configurable character sets.' },
  时间戳转换: { title: 'Timestamp Converter', description: 'Convert seconds, milliseconds, and date strings to local time and ISO output.' },
  'JSON 美化 / 压缩': { title: 'JSON Format / Minify', description: 'Format JSON for reading or minify it into one line for configs and requests.' },
  '代码混淆 / 压缩': { title: 'Code Obfuscate / Minify', description: 'Minify JavaScript, CSS, or HTML, and obfuscate JavaScript when needed.' },
  参数分析: { title: 'Parameter Analyzer', description: 'Parse URL query strings, form-like parameters, or JSON key-value data.' },
  敏感词快速检测: { title: 'Sensitive Word Check', description: 'Run a quick first-pass scan with a lightweight built-in word list.' },
  'Favicon 生成器': { title: 'Favicon Generator', description: 'Generate common PNG favicon sizes and matching head markup from one image.' },
  图片格式转换: { title: 'Image Format Converter', description: 'Convert PNG, JPG, and WebP locally with adjustable output quality.' },
  '图片裁剪 / 改尺寸': { title: 'Crop / Resize', description: 'Resize images to exact dimensions, optionally locking the aspect ratio.' },
  图片加水印: { title: 'Image Watermark', description: 'Add text watermarks with size, color, opacity, position, or tiled layout.' },
  图片主色调提取: { title: 'Dominant Color Extractor', description: 'Extract dominant colors from an image and copy palette values.' },
  二维码生成: { title: 'QR Code Generator', description: 'Generate a PNG QR code locally from any text.' },
  图片与Base64互转: { title: 'Image / Base64', description: 'Convert images to Data URLs, or paste Base64 to preview and validate.' },
  '图片与 Base64 互转': { title: 'Image / Base64', description: 'Convert images to Data URLs, or paste Base64 to preview and validate.' },
  'SVG 转图片': { title: 'SVG to Image', description: 'Paste SVG source and export a local PNG preview.' },
  图片压缩: { title: 'Image Compression', description: 'Compress images locally with Canvas and export JPEG or WebP.' },
  '摸头 GIF（图片上传版）': { title: 'Pet GIF', description: 'Upload an avatar and generate a lightweight transparent petting GIF locally.' },
  'llms.txt 生成器': { title: 'llms.txt Generator', description: 'Create a clean llms.txt file so AI models can better read and cite your site.' },
  网站流量分析: { title: 'Site Traffic Analysis', description: 'Estimate monthly visits, visit duration, bounce rate, traffic sources, and regions.' },
  'Meta 标签 / TDK 生成': { title: 'Meta Tags / TDK', description: 'Generate SEO, Open Graph, and Twitter card tags for the page head.' },
  'robots.txt 生成器': { title: 'robots.txt Generator', description: 'Generate robots.txt rules for search engines and AI crawlers.' },
  '结构化数据 JSON-LD': { title: 'Structured Data JSON-LD', description: 'Generate schema.org JSON-LD for articles, websites, and organizations.' },
  关键词密度分析: { title: 'Keyword Density', description: 'Analyze word frequency and target keyword density in pasted content.' },
  '客户端 IP': { title: 'Client IP', description: 'Read public request source information to check proxies and visitor addresses.' },
  'DNS 查询': { title: 'DNS Lookup', description: 'Query A, AAAA, MX, NS, TXT, and other common DNS records.' },
  'Ping（TCP 连通性）': { title: 'Ping (TCP Connectivity)', description: 'Measure TCP connection latency to check whether a host and port are reachable.' },
  端口扫描: { title: 'Port Scan', description: 'Scan a small list or range of ports with safety limits.' },
  'URL 状态检测': { title: 'URL Status', description: 'Check final URL, status code, redirects, and basic response headers.' },
  网页元数据提取: { title: 'Web Metadata', description: 'Extract title, description, canonical, favicon, and common social metadata.' },
  网页图片提取: { title: 'Web Images', description: 'List common image assets from a page.' },
  '网页转 Markdown': { title: 'Web to Markdown', description: 'Fetch page content and convert the main body to Markdown.' },
  'Minecraft 玩家信息': { title: 'Minecraft Player', description: 'Look up a Minecraft player UUID, avatar, and skin by username.' },
  'Minecraft 服务器信息': { title: 'Minecraft Server', description: 'Check Java or Bedrock server status with a public API.' },
  'GitHub 仓库信息': { title: 'GitHub Repository', description: 'Parse owner/repo and show stars, forks, topics, and language distribution.' },
  Gravatar: { title: 'Gravatar', description: 'Generate Gravatar avatar and profile URLs from an email hash.' },
  '基础 IP 归属': { title: 'Basic IP Location', description: 'Look up an input IP or the current request source with a local GeoIP library.' },
  手机号归属地: { title: 'Mobile Number Area', description: 'Query province, city, and carrier for mainland China mobile numbers locally.' },
  'Bing 每日壁纸': { title: 'Bing Daily Wallpaper', description: 'Fetch the current Bing daily wallpaper for backgrounds or collections.' },
  '答案之书 / 诗词 / 历史今天': { title: 'Book of Answers / Poetry / Today in History', description: 'Get a small piece of inspiration, poetry, or historical trivia.' },
  房贷计算器: { title: 'Mortgage Calculator', description: 'Calculate monthly payments, total interest, and total repayment.' },
  个税计算器: { title: 'Income Tax Calculator', description: 'Estimate monthly income tax and after-tax salary.' },
  'BMI 计算器': { title: 'BMI Calculator', description: 'Calculate BMI and classify the result using common Chinese ranges.' },
  日期间隔计算: { title: 'Date Difference', description: 'Calculate days, weeks, months, and years between two dates.' },
  单位换算: { title: 'Unit Converter', description: 'Convert common length, weight, area, storage, and temperature units.' },
  简繁体转换: { title: 'Simplified / Traditional', description: 'Convert between Simplified and Traditional Chinese with OpenCC.' },
  汉字转拼音: { title: 'Chinese to Pinyin', description: 'Convert Chinese text to pinyin with tones, numeric tones, or initials.' },
  中文假数据生成: { title: 'Chinese Fake Data', description: 'Generate fictional Chinese names, phone numbers, emails, and addresses.' },
  'CSS 渐变生成': { title: 'CSS Gradient', description: 'Create linear or radial gradients and copy the CSS.' },
  'box-shadow 生成': { title: 'box-shadow Generator', description: 'Tune offset, blur, spread, color, and opacity with a live preview.' },
  圆角生成: { title: 'Border Radius', description: 'Adjust each corner and copy border-radius CSS.' },
  调色板生成: { title: 'Palette Generator', description: 'Generate a light-to-dark color scale from a base color.' },
};

export function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: {
  icon: any;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const localized = getPathLocale(pathname) === 'en' ? sectionCardEn[title] : undefined;

  return (
    <article data-i18n-noskip className={`${cardClass} ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff]">
            {localized?.title ?? title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#6c5b98] dark:text-[#b9aadf]">
            {localized?.description ?? description}
          </p>
        </div>
      </div>
      {children}
    </article>
  );
}

export function OutputBox({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${outputClass} ${className}`}>{children}</div>;
}

export function downloadPlainText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
}

export function FancySelect<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  const currentOption = options.find((option) => option.value === value);

  return (
    <SimpleDropdown
      align="start"
      className="min-w-[13rem] rounded-[22px] border border-[#dacdff] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,239,255,0.96))] p-2 shadow-[0_24px_70px_rgba(91,61,245,0.18)] dark:border-[#3a2f58] dark:bg-[linear-gradient(180deg,rgba(30,23,49,0.98),rgba(18,13,30,0.98))]"
      trigger={
        <button
          type="button"
          aria-label={ariaLabel}
          className="flex h-9 w-full items-center justify-between rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-1 text-left text-sm text-[#2f2154] shadow-sm transition hover:border-[#b99fff] focus-visible:border-[#8b6bff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff]"
        >
          <span className="truncate font-medium">
            {currentOption?.label || ariaLabel}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#745da9] dark:text-[#c7baf1]" />
        </button>
      }
    >
      {options.map((option) => (
        <SimpleDropdownItem
          key={option.value}
          onClick={() => onChange(option.value)}
          active={option.value === value}
          className={cn(
            'rounded-2xl px-3 py-2.5 text-[#2f2154] dark:text-[#f4efff]',
            option.value === value
              ? 'bg-[#ece3ff] text-[#4f31d7] dark:bg-[#2b1f43] dark:text-[#efe9ff]'
              : 'hover:text-[#4f31d7] dark:hover:text-[#ffffff]',
          )}
        >
          <span className="text-sm font-medium">{option.label}</span>
          {option.value === value ? (
            <Check className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </SimpleDropdownItem>
      ))}
    </SimpleDropdown>
  );
}

export function FancyCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition select-none',
        checked
          ? 'border-[#b69cff] bg-[linear-gradient(135deg,rgba(240,231,255,0.96),rgba(234,224,255,0.88))] text-[#4327ba] shadow-[0_14px_36px_rgba(91,61,245,0.12)] dark:border-[#7454cf] dark:bg-[linear-gradient(135deg,rgba(40,28,69,0.94),rgba(31,22,53,0.9))] dark:text-[#f2edff]'
          : 'border-[#ded2ff] bg-white/55 text-[#5e4f8a] hover:border-[#b99fff] hover:bg-[#f7f2ff] dark:border-[#382d55] dark:bg-white/[0.03] dark:text-[#cbbff0] dark:hover:border-[#7156c8] dark:hover:bg-white/[0.05]',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[8px] border transition',
          checked
            ? 'border-[#6d46ff] bg-[#5b3df5] text-white shadow-[0_8px_18px_rgba(91,61,245,0.24)] dark:border-[#a58eff] dark:bg-[#8e72ff]'
            : 'border-[#bfaeff] bg-white/90 text-transparent dark:border-[#54407f] dark:bg-[#1a132d]',
        )}
      >
        <Check
          className={cn(
            'h-3.5 w-3.5 transition',
            checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0',
          )}
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export function ToolFileInput({
  accept,
  onChange,
  hint,
}: {
  accept?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  hint?: string;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const files = event.dataTransfer.files;
        if (files && files.length && inputRef.current) {
          inputRef.current.files = files;
          setFileName(files[0]?.name ?? '');
          onChange({
            target: inputRef.current,
          } as unknown as ChangeEvent<HTMLInputElement>);
        }
      }}
      className={cn(
        'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition',
        dragging
          ? 'border-[#8b6bff] bg-[#f1ebff] dark:border-[#8b6bff] dark:bg-white/[0.06]'
          : 'border-[#cdbcff] bg-white/60 hover:border-[#8b6bff] hover:bg-[#f5f0ff] dark:border-[#3a2f58] dark:bg-white/[0.03] dark:hover:border-[#8b6bff] dark:hover:bg-white/[0.05]',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          setFileName(event.target.files?.[0]?.name ?? '');
          onChange(event);
        }}
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ece3ff] text-[#5b3df5] transition group-hover:scale-105 dark:bg-[#2b1f43] dark:text-[#cbbcff]">
        <Upload className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">
        {fileName || t('点击或拖拽文件到此处')}
      </span>
      <span className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
        {hint || t('支持点击选择或拖拽上传')}
      </span>
    </label>
  );
}
