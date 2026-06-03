"use client";

import {
  BookOpenText,
  ChevronDown,
  Clock3,
  DatabaseZap,
  FileCode2,
  FileJson2,
  Globe,
  Hash,
  ImageIcon,
  MapPinned,
  Network,
  QrCode,
  RefreshCcw,
  ScanSearch,
  ScrollText,
  ShieldAlert,
  Sparkles,
  SquareTerminal,
  Swords,
  Wand2,
  Wifi,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/I18nProvider";
import { Button } from "@/components/ui/button";
import SiteTrafficTool from "@/components/SiteTrafficTool";
import {
  ColorTool,
  DataConvertTool,
  FaviconTool,
  RegexTesterTool,
  RmbCapitalTool,
  WordCountTool,
} from "@/components/tools/basic-tools";
import {
  BaseConvertTool,
  CaseConvertTool,
  CronTool,
  JwtDecodeTool,
  ShaHashTool,
  TextDiffTool,
} from "@/components/tools/dev-tools";
import {
  ColorExtractTool,
  ImageConvertTool,
  ImageResizeTool,
  ImageWatermarkTool,
} from "@/components/tools/image-tools";
import {
  BmiTool,
  DateDiffTool,
  IncomeTaxTool,
  LoanCalcTool,
  UnitConvertTool,
} from "@/components/tools/calc-tools";
import {
  ChineseFakerTool,
  HanziConvertTool,
  PinyinTool,
} from "@/components/tools/chinese-tools";
import {
  BorderRadiusTool,
  BoxShadowTool,
  CssGradientTool,
  PaletteTool,
} from "@/components/tools/css-tools";
import { SectionCard } from "@/components/tools/tool-ui";
import {
  AesTool,
  Base64Tool,
  CodeObfuscateTool,
  JsonTool,
  Md5Tool,
  ParamsTool,
  RandomStringTool,
  SensitiveTool,
  TimestampTool,
} from "@/components/tools/local-classic-tools";
import {
  ClientIpTool,
  DnsLookupTool,
  PingTool,
  PortScanTool,
  UrlStatusTool,
  WebImagesTool,
  WebMarkdownTool,
  WebMetadataTool,
} from "@/components/tools/network-tools";
import {
  ImageBase64Tool,
  ImageCompressTool,
  PetGifTool,
  QrcodeTool,
  SvgToImageTool,
} from "@/components/tools/image-classic-tools";
import {
  JsonLdTool,
  KeywordDensityTool,
  LlmsTxtTool,
  MetaTagsTool,
  RobotsTxtTool,
} from "@/components/tools/seo-tools";
import {
  BingWallpaperTool,
  ContentTools,
  GithubRepoTool,
  GravatarTool,
  IpGeoTool,
  MinecraftPlayerTool,
  MinecraftServerTool,
  MobileAreaTool,
} from "@/components/tools/data-tools";
import { cn } from "@/lib/utils";
import { TranslationProvider } from "./tools/TranslationContext";

const sectionMeta = [
  {
    id: "local-tools",
    title: "纯本地工具",
    description:
      "常用的本地小工具：字数统计、金额大写、正则测试、JSON、Base64、MD5、时间戳、颜色与编码转换，全部在浏览器本地完成，安全不上传。",
  },
  {
    id: "image-tools",
    title: "图片处理",
    description:
      "在线图片工具：二维码生成、格式转换、压缩、裁剪、加水印、Favicon 与主色提取，图片在本地处理无需上传。",
  },
  {
    id: "network-tools",
    title: "网络基础",
    description:
      "在线网络工具：DNS 查询、Ping 连通性、端口扫描、URL 状态检测、网页元数据与图片提取、网页转 Markdown。",
  },
  {
    id: "public-data-tools",
    title: "公开数据",
    description:
      "实用信息查询：Minecraft、GitHub 仓库、Gravatar、IP 与手机号归属、Bing 每日壁纸等公开数据，一键查询。",
  },
  {
    id: "seo-geo-tools",
    title: "SEO | GEO 工具",
    description:
      "面向搜索引擎（SEO）与生成式 AI（GEO）的优化工具：llms.txt、Meta 标签 / TDK、robots.txt、结构化数据 JSON-LD 与关键词密度分析。",
  },
  {
    id: "calc-tools",
    title: "计算换算",
    description:
      "贴近生活与工作的计算器：房贷、个税、BMI、日期间隔与常用单位换算，输入即算，结果仅供参考。",
  },
  {
    id: "cn-tools",
    title: "中文工具",
    description:
      "面向中文场景的实用工具：简繁体转换、汉字转拼音与中文测试假数据生成。",
  },
  {
    id: "css-tools",
    title: "前端 / CSS",
    description:
      "面向前端与设计的可视化生成器：CSS 渐变、box-shadow 阴影、圆角与调色板，所见即所得并一键复制代码。",
  },
] as const;

type SectionId = (typeof sectionMeta)[number]["id"];

const sectionMetaEn = {
  "local-tools": {
    title: "Local Tools",
    description:
      "Common browser-local utilities for word count, RMB uppercase, regex testing, JSON, Base64, MD5, timestamps, colors, and encoding conversion.",
  },
  "image-tools": {
    title: "Image Tools",
    description:
      "Online image tools for QR codes, format conversion, compression, cropping, watermarks, favicons, and dominant color extraction.",
  },
  "network-tools": {
    title: "Network Basics",
    description:
      "Network utilities for DNS lookup, ping, port scanning, URL status, webpage metadata, image extraction, and web-to-Markdown conversion.",
  },
  "public-data-tools": {
    title: "Public Data",
    description:
      "Useful lookups for Minecraft, GitHub repositories, Gravatar, IP and mobile number location, Bing daily wallpaper, and more.",
  },
  "seo-geo-tools": {
    title: "SEO | GEO Tools",
    description:
      "Optimization tools for search engines and generative AI: llms.txt, meta tags, robots.txt, JSON-LD, and keyword density analysis.",
  },
  "calc-tools": {
    title: "Calculators",
    description:
      "Practical calculators for mortgage, income tax, BMI, date difference, and common unit conversion.",
  },
  "cn-tools": {
    title: "Chinese Tools",
    description:
      "Utilities for Chinese scenarios: simplified/traditional conversion, Chinese-to-pinyin, and Chinese fake data generation.",
  },
  "css-tools": {
    title: "Frontend / CSS",
    description:
      "Visual generators for CSS gradients, box-shadow, border radius, and color palettes with copy-ready code.",
  },
} as const satisfies Record<SectionId, { title: string; description: string }>;

const toolCatalog = [
  { id: "word-count", title: "字数统计", sectionId: "local-tools" },
  { id: "rmb-capital", title: "人民币金额大写", sectionId: "local-tools" },
  { id: "regex-tester", title: "正则表达式测试", sectionId: "local-tools" },
  { id: "color-tool", title: "颜色工具 / 渐变", sectionId: "local-tools" },
  { id: "data-convert", title: "JSON ↔ CSV 互转", sectionId: "local-tools" },
  { id: "jwt-decode", title: "JWT 解码", sectionId: "local-tools" },
  { id: "cron", title: "Cron 表达式解析", sectionId: "local-tools" },
  { id: "sha-hash", title: "SHA 哈希", sectionId: "local-tools" },
  { id: "base-convert", title: "进制转换", sectionId: "local-tools" },
  { id: "text-diff", title: "文本 Diff 对比", sectionId: "local-tools" },
  { id: "case-convert", title: "命名 / 大小写转换", sectionId: "local-tools" },
  { id: "aes", title: "AES 加解密", sectionId: "local-tools" },
  { id: "base64", title: "Base64 编解码", sectionId: "local-tools" },
  { id: "md5", title: "MD5 计算与校验", sectionId: "local-tools" },
  { id: "random", title: "随机数 / 随机字符串", sectionId: "local-tools" },
  { id: "timestamp", title: "时间戳转换", sectionId: "local-tools" },
  { id: "json", title: "JSON 美化 / 压缩", sectionId: "local-tools" },
  { id: "code-obfuscate", title: "代码混淆 / 压缩", sectionId: "local-tools" },
  { id: "params", title: "参数分析", sectionId: "local-tools" },
  { id: "sensitive", title: "敏感词快速检测", sectionId: "local-tools" },
  { id: "favicon", title: "Favicon 生成器", sectionId: "image-tools" },
  { id: "image-convert", title: "图片格式转换", sectionId: "image-tools" },
  { id: "image-resize", title: "图片裁剪 / 改尺寸", sectionId: "image-tools" },
  { id: "image-watermark", title: "图片加水印", sectionId: "image-tools" },
  { id: "color-extract", title: "图片主色调提取", sectionId: "image-tools" },
  { id: "qrcode", title: "二维码生成", sectionId: "image-tools" },
  { id: "image-base64", title: "图片与 Base64 互转", sectionId: "image-tools" },
  { id: "svg-image", title: "SVG 转图片", sectionId: "image-tools" },
  { id: "image-compress", title: "图片压缩", sectionId: "image-tools" },
  { id: "pet-gif", title: "摸头 GIF（图片上传版）", sectionId: "image-tools" },
  { id: "llms-txt", title: "llms.txt 生成器", sectionId: "seo-geo-tools" },
  { id: "site-traffic", title: "网站流量分析", sectionId: "seo-geo-tools" },
  { id: "meta-tags", title: "Meta 标签 / TDK 生成", sectionId: "seo-geo-tools" },
  { id: "robots-txt", title: "robots.txt 生成器", sectionId: "seo-geo-tools" },
  { id: "json-ld", title: "结构化数据 JSON-LD", sectionId: "seo-geo-tools" },
  { id: "keyword-density", title: "关键词密度分析", sectionId: "seo-geo-tools" },
  { id: "client-ip", title: "客户端 IP", sectionId: "network-tools" },
  { id: "dns-lookup", title: "DNS 查询", sectionId: "network-tools" },
  { id: "ping", title: "Ping（TCP 连通性）", sectionId: "network-tools" },
  { id: "port-scan", title: "端口扫描", sectionId: "network-tools" },
  { id: "url-status", title: "URL 状态检测", sectionId: "network-tools" },
  { id: "web-metadata", title: "网页元数据提取", sectionId: "network-tools" },
  { id: "web-images", title: "网页图片提取", sectionId: "network-tools" },
  { id: "web-markdown", title: "网页转 Markdown", sectionId: "network-tools" },
  {
    id: "minecraft-player",
    title: "Minecraft 玩家信息",
    sectionId: "public-data-tools",
  },
  {
    id: "minecraft-server",
    title: "Minecraft 服务器信息",
    sectionId: "public-data-tools",
  },
  {
    id: "github-repo",
    title: "GitHub 仓库信息",
    sectionId: "public-data-tools",
  },
  { id: "gravatar", title: "Gravatar", sectionId: "public-data-tools" },
  { id: "ip-geo", title: "基础 IP 归属", sectionId: "public-data-tools" },
  { id: "mobile-area", title: "手机号归属地", sectionId: "public-data-tools" },
  {
    id: "bing-wallpaper",
    title: "Bing 每日壁纸",
    sectionId: "public-data-tools",
  },
  {
    id: "content-tools",
    title: "答案之书 / 诗词 / 历史今天",
    sectionId: "public-data-tools",
  },
  { id: "loan", title: "房贷计算器", sectionId: "calc-tools" },
  { id: "income-tax", title: "个税计算器", sectionId: "calc-tools" },
  { id: "bmi", title: "BMI 计算器", sectionId: "calc-tools" },
  { id: "date-diff", title: "日期间隔计算", sectionId: "calc-tools" },
  { id: "unit-convert", title: "单位换算", sectionId: "calc-tools" },
  { id: "hanzi-convert", title: "简繁体转换", sectionId: "cn-tools" },
  { id: "pinyin", title: "汉字转拼音", sectionId: "cn-tools" },
  { id: "chinese-faker", title: "中文假数据生成", sectionId: "cn-tools" },
  { id: "css-gradient", title: "CSS 渐变生成", sectionId: "css-tools" },
  { id: "box-shadow", title: "box-shadow 生成", sectionId: "css-tools" },
  { id: "border-radius", title: "圆角生成", sectionId: "css-tools" },
  { id: "palette", title: "调色板生成", sectionId: "css-tools" },
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  sectionId: SectionId;
}>;

type ToolId = (typeof toolCatalog)[number]["id"];

const toolTitleEn: Record<ToolId, string> = {
  "word-count": "Word Count",
  "rmb-capital": "RMB Uppercase",
  "regex-tester": "Regex Tester",
  "color-tool": "Color Tool / Gradient",
  "data-convert": "JSON <-> CSV",
  "jwt-decode": "JWT Decode",
  cron: "Cron Parser",
  "sha-hash": "SHA Hash",
  "base-convert": "Base Conversion",
  "text-diff": "Text Diff",
  "case-convert": "Case Conversion",
  aes: "AES Encrypt / Decrypt",
  base64: "Base64 Encode / Decode",
  md5: "MD5 Calculate / Verify",
  random: "Random Number / String",
  timestamp: "Timestamp Converter",
  json: "JSON Format / Minify",
  "code-obfuscate": "Code Obfuscate / Minify",
  params: "Parameter Analyzer",
  sensitive: "Sensitive Word Check",
  favicon: "Favicon Generator",
  "image-convert": "Image Format Converter",
  "image-resize": "Crop / Resize",
  "image-watermark": "Image Watermark",
  "color-extract": "Dominant Color Extractor",
  qrcode: "QR Code Generator",
  "image-base64": "Image / Base64",
  "svg-image": "SVG to Image",
  "image-compress": "Image Compression",
  "pet-gif": "Pet GIF",
  "llms-txt": "llms.txt Generator",
  "site-traffic": "Site Traffic Analysis",
  "meta-tags": "Meta Tags / TDK",
  "robots-txt": "robots.txt Generator",
  "json-ld": "Structured Data JSON-LD",
  "keyword-density": "Keyword Density",
  "client-ip": "Client IP",
  "dns-lookup": "DNS Lookup",
  ping: "Ping",
  "port-scan": "Port Scan",
  "url-status": "URL Status",
  "web-metadata": "Web Metadata",
  "web-images": "Web Images",
  "web-markdown": "Web to Markdown",
  "minecraft-player": "Minecraft Player",
  "minecraft-server": "Minecraft Server",
  "github-repo": "GitHub Repository",
  gravatar: "Gravatar",
  "ip-geo": "Basic IP Location",
  "mobile-area": "Mobile Number Area",
  "bing-wallpaper": "Bing Daily Wallpaper",
  "content-tools": "Book of Answers / Poetry / Today in History",
  loan: "Mortgage Calculator",
  "income-tax": "Income Tax Calculator",
  bmi: "BMI Calculator",
  "date-diff": "Date Difference",
  "unit-convert": "Unit Converter",
  "hanzi-convert": "Simplified / Traditional",
  pinyin: "Chinese to Pinyin",
  "chinese-faker": "Chinese Fake Data",
  "css-gradient": "CSS Gradient",
  "box-shadow": "box-shadow",
  "border-radius": "Border Radius",
  palette: "Palette",
};

const sectionMetaZh: Record<SectionId, { title: string; description: string }> = {
  "local-tools": {
    title: "纯本地工具",
    description:
      "常用的本地小工具：字数统计、金额大写、正则测试、JSON、Base64、MD5、时间戳、颜色与编码转换，全部在浏览器本地完成，安全不上传。",
  },
  "image-tools": {
    title: "图片处理",
    description:
      "在线图片工具：二维码生成、格式转换、压缩、裁剪、加水印、Favicon 与主色提取，图片在本地处理无需上传。",
  },
  "network-tools": {
    title: "网络基础",
    description:
      "在线网络工具：DNS 查询、Ping 连通性、端口扫描、URL 状态检测、网页元数据与图片提取、网页转 Markdown。",
  },
  "public-data-tools": {
    title: "公开数据",
    description:
      "实用信息查询：Minecraft、GitHub 仓库、Gravatar、IP 与手机号归属、Bing 每日壁纸等公开数据，一键查询。",
  },
  "seo-geo-tools": {
    title: "SEO | GEO 工具",
    description:
      "面向搜索引擎（SEO）与生成式 AI（GEO）的优化工具：llms.txt、Meta 标签 / TDK、robots.txt、结构化数据 JSON-LD 与关键词密度分析。",
  },
  "calc-tools": {
    title: "计算换算",
    description:
      "贴近生活与工作的计算器：房贷、个税、BMI、日期间隔与常用单位换算，输入即算，结果仅供参考。",
  },
  "cn-tools": {
    title: "中文工具",
    description:
      "面向中文场景的实用工具：简繁体转换、汉字转拼音与中文测试假数据生成。",
  },
  "css-tools": {
    title: "前端 / CSS",
    description:
      "面向前端与设计的可视化生成器：CSS 渐变、box-shadow 阴影、圆角与调色板，所见即所得并一键复制代码。",
  },
};

const toolTitleZh: Record<ToolId, string> = {
  "word-count": "字数统计",
  "rmb-capital": "人民币金额大写",
  "regex-tester": "正则表达式测试",
  "color-tool": "颜色工具 / 渐变",
  "data-convert": "JSON <-> CSV 互转",
  "jwt-decode": "JWT 解码",
  cron: "Cron 表达式解析",
  "sha-hash": "SHA 哈希",
  "base-convert": "进制转换",
  "text-diff": "文本 Diff 对比",
  "case-convert": "命名 / 大小写转换",
  aes: "AES 加解密",
  base64: "Base64 编解码",
  md5: "MD5 计算与校验",
  random: "随机数 / 随机字符串",
  timestamp: "时间戳转换",
  json: "JSON 美化 / 压缩",
  "code-obfuscate": "代码混淆 / 压缩",
  params: "参数分析",
  sensitive: "敏感词快速检测",
  favicon: "Favicon 生成器",
  "image-convert": "图片格式转换",
  "image-resize": "图片裁剪 / 改尺寸",
  "image-watermark": "图片加水印",
  "color-extract": "图片主色调提取",
  qrcode: "二维码生成",
  "image-base64": "图片与 Base64 互转",
  "svg-image": "SVG 转图片",
  "image-compress": "图片压缩",
  "pet-gif": "摸头 GIF",
  "llms-txt": "llms.txt 生成器",
  "site-traffic": "网站流量分析",
  "meta-tags": "Meta 标签 / TDK 生成",
  "robots-txt": "robots.txt 生成器",
  "json-ld": "结构化数据 JSON-LD",
  "keyword-density": "关键词密度分析",
  "client-ip": "客户端 IP",
  "dns-lookup": "DNS 查询",
  ping: "Ping（TCP 连通性）",
  "port-scan": "端口扫描",
  "url-status": "URL 状态检测",
  "web-metadata": "网页元数据提取",
  "web-images": "网页图片提取",
  "web-markdown": "网页转 Markdown",
  "minecraft-player": "Minecraft 玩家信息",
  "minecraft-server": "Minecraft 服务器信息",
  "github-repo": "GitHub 仓库信息",
  gravatar: "Gravatar",
  "ip-geo": "基础 IP 归属",
  "mobile-area": "手机号归属地",
  "bing-wallpaper": "Bing 每日壁纸",
  "content-tools": "答案之书 / 诗词 / 历史今天",
  loan: "房贷计算器",
  "income-tax": "个税计算器",
  bmi: "BMI 计算器",
  "date-diff": "日期间隔计算",
  "unit-convert": "单位换算",
  "hanzi-convert": "简繁体转换",
  pinyin: "汉字转拼音",
  "chinese-faker": "中文假数据生成",
  "css-gradient": "CSS 渐变生成",
  "box-shadow": "box-shadow 生成",
  "border-radius": "圆角生成",
  palette: "调色板生成",
};
type ToolFilter = "all" | ToolId;
type SectionFilter = "all" | SectionId;

export default function ToolsClientPage({
  section,
  initialTool,
}: {
  section?: SectionId;
  initialTool?: string;
}) {
  const { locale: currentLocale, localizedHref } = useI18n();
  const catalog = useMemo(
    () =>
      toolCatalog.map((tool) => ({
        ...tool,
        title: currentLocale === "en" ? toolTitleEn[tool.id] : toolTitleZh[tool.id],
      })),
    [currentLocale]
  );
  const sections = useMemo(
    () =>
      sectionMeta.map((sectionItem) => ({
        ...sectionItem,
        ...(currentLocale === "en" ? sectionMetaEn[sectionItem.id] : sectionMetaZh[sectionItem.id]),
        count: catalog.filter((tool) => tool.sectionId === sectionItem.id).length,
        tools: catalog.filter((tool) => tool.sectionId === sectionItem.id),
      })),
    [catalog, currentLocale]
  );
  const validInitialTool: ToolFilter =
    initialTool &&
    catalog.some(
      (tool) =>
        tool.id === initialTool && (!section || tool.sectionId === section),
    )
      ? (initialTool as ToolFilter)
      : "all";

  const [selectedTool, setSelectedTool] = useState<ToolFilter>(validInitialTool);
  const [selectedSection, setSelectedSection] = useState<SectionFilter>(
    section ?? "all",
  );

  const activeTool =
    selectedTool === "all"
      ? null
      : catalog.find((tool) => tool.id === selectedTool) || null;
  const isToolVisible = (toolId: ToolId) =>
    selectedTool === "all" || selectedTool === toolId;
  const isSectionVisible = (sectionId: SectionId) =>
    selectedTool !== "all"
      ? activeTool?.sectionId === sectionId
      : selectedSection === "all" || selectedSection === sectionId;

  const sectionGridClass = cn(
    "grid gap-5",
    selectedTool === "all" ? "lg:grid-cols-2" : "grid-cols-1",
  );

  // 单模块页面（带 section）时，分区标题作为页面的 h1，便于 SEO
  const SectionHeading = section ? "h1" : "h2";
  const footerNote =
    currentLocale === "en"
      ? {
          before:
            "Most tools here run locally in your browser and do not upload your content; the few that require network access only read public information. For security reasons, network tools do not support querying",
          after:
            "and other intranet addresses. Feel free to bookmark this page to keep these utilities handy.",
          resources: "Go to Resources",
          about: "Go to About",
        }
      : {
          before:
            "这里的工具大多在你的浏览器本地完成，不会上传你的内容；少数需要联网的查询也只读取公开信息。出于安全考虑，网络类工具不支持查询",
          after: "等内网地址。欢迎收藏本页，常用工具随取随用。",
          resources: "去看资源页",
          about: "查看关于页",
        };

  const renderToolTabs = (sectionId: SectionId) => {
    const toolsInSection = catalog.filter((tool) => tool.sectionId === sectionId);
    if (toolsInSection.length <= 1) return null;
    const tabBase = "rounded-full border px-4 py-2 text-sm transition";
    const tabActive =
      "border-[#5b3df5] bg-[#5b3df5] text-white shadow-[0_12px_30px_rgba(91,61,245,0.22)]";
    const tabInactive =
      "border-[#d9ccff] bg-white/75 text-[#5c4a88] hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#362b53] dark:bg-white/[0.04] dark:text-[#d2c6f3]";
    return (
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedTool("all")}
          className={cn(tabBase, selectedTool === "all" ? tabActive : tabInactive)}
        >
          {currentLocale === "en" ? "All" : "全部"}
        </button>
        {toolsInSection.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setSelectedTool(tool.id)}
            className={cn(tabBase, selectedTool === tool.id ? tabActive : tabInactive)}
          >
            {tool.title}
          </button>
        ))}
      </div>
    );
  };

  return (
    <TranslationProvider>
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-20">
      {section && (
        <div className="mb-6 flex items-center gap-2 text-sm text-[#7b69a5] dark:text-[#af9fda]">
          <Link
            href={localizedHref("/tools") as Route}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ddd0ff] bg-white/70 px-3.5 py-1.5 font-medium text-[#5b3df5] transition hover:border-[#8b6bff] hover:bg-[#f3edff] dark:border-[#3a2f58] dark:bg-white/[0.05] dark:text-[#cbbcff] dark:hover:bg-white/[0.08]"
          >
            <ChevronDown className="h-4 w-4 rotate-90" />
            {currentLocale === "en" ? "Back to tools menu" : "返回工具菜单"}
          </Link>
          <span className="text-[#c2b6e6] dark:text-[#6f6196]">/</span>
          <span className="text-[#5c4a88] dark:text-[#d2c6f3]">
            {sections.find((item) => item.id === section)?.title}
          </span>
        </div>
      )}

      {isSectionVisible("local-tools") && (
        <section id="local-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[0].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[0].description}
            </p>
          </div>

          {renderToolTabs("local-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={Hash}
              title="字数统计"
              description="实时统计总字符数、不含空格字符、中文字数、英文单词、标点、行数与段落，写文章和投稿凑字数都方便。"
              className={isToolVisible("word-count") ? "" : "hidden"}
            >
              <WordCountTool />
            </SectionCard>

            <SectionCard
              icon={ScrollText}
              title="人民币金额大写"
              description="输入阿拉伯数字金额，自动转换成规范的人民币中文大写（含角分），开发票、合同、财务记账都用得上。"
              className={isToolVisible("rmb-capital") ? "" : "hidden"}
            >
              <RmbCapitalTool />
            </SectionCard>

            <SectionCard
              icon={ScanSearch}
              title="正则表达式测试"
              description="在线测试正则表达式，支持 g/i/m/s/u 标志，实时显示匹配结果，调试与学习正则的常用工具。"
              className={isToolVisible("regex-tester") ? "" : "hidden"}
            >
              <RegexTesterTool />
            </SectionCard>

            <SectionCard
              icon={Sparkles}
              title="颜色工具 / 渐变"
              description="HEX / RGB / HSL 互转、取色器、WCAG 对比度检测与 CSS 渐变生成，前端与设计常用。"
              className={isToolVisible("color-tool") ? "" : "hidden"}
            >
              <ColorTool />
            </SectionCard>

            <SectionCard
              icon={FileJson2}
              title="JSON ↔ CSV 互转"
              description="JSON 数组与 CSV 表格互相转换，导入导出表格数据、清洗数据时很方便。"
              className={isToolVisible("data-convert") ? "" : "hidden"}
            >
              <DataConvertTool />
            </SectionCard>

            <SectionCard
              icon={FileCode2}
              title="JWT 解码"
              description="在线解析 JWT Token，解码 Header 与 Payload，并直观显示签发 / 过期时间，方便调试登录态。"
              className={isToolVisible("jwt-decode") ? "" : "hidden"}
            >
              <JwtDecodeTool />
            </SectionCard>

            <SectionCard
              icon={Clock3}
              title="Cron 表达式解析"
              description="解析标准 5 段 cron 表达式，计算接下来的执行时间，写定时任务时不再靠猜。"
              className={isToolVisible("cron") ? "" : "hidden"}
            >
              <CronTool />
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="SHA 哈希"
              description="基于浏览器 Web Crypto 计算 SHA-1 / SHA-256 / SHA-384 / SHA-512，本地完成，不上传内容。"
              className={isToolVisible("sha-hash") ? "" : "hidden"}
            >
              <ShaHashTool />
            </SectionCard>

            <SectionCard
              icon={DatabaseZap}
              title="进制转换"
              description="二进制 / 八进制 / 十进制 / 十六进制（支持 2-36 进制）互转，基于 BigInt 大数也不丢精度。"
              className={isToolVisible("base-convert") ? "" : "hidden"}
            >
              <BaseConvertTool />
            </SectionCard>

            <SectionCard
              icon={ScanSearch}
              title="文本 Diff 对比"
              description="逐行对比两段文本，高亮新增与删除行，核对版本、改动与配置差异很方便。"
              className={isToolVisible("text-diff") ? "" : "hidden"}
            >
              <TextDiffTool />
            </SectionCard>

            <SectionCard
              icon={FileCode2}
              title="命名 / 大小写转换"
              description="一键在 camelCase、PascalCase、snake_case、kebab-case、CONSTANT_CASE、Title Case 之间转换。"
              className={isToolVisible("case-convert") ? "" : "hidden"}
            >
              <CaseConvertTool />
            </SectionCard>

            <SectionCard
              icon={ShieldAlert}
              title="AES 加解密"
              description="使用浏览器内建的 Web Crypto 实现 AES-GCM，本地完成，不上传明文。"
              className={isToolVisible("aes") ? "" : "hidden"}
            >
              <AesTool />
            </SectionCard>

            <SectionCard
              icon={SquareTerminal}
              title="Base64 编解码"
              description="支持 Unicode 文本安全编码，也可直接拿来测试接口参数。"
              className={isToolVisible("base64") ? "" : "hidden"}
            >
              <Base64Tool />
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="MD5 计算与校验"
              description="计算文本的 MD5 值，并可与目标哈希快速比对、校验文件或内容是否一致。"
              className={isToolVisible("md5") ? "" : "hidden"}
            >
              <Md5Tool />
            </SectionCard>

            <SectionCard
              icon={Sparkles}
              title="随机数 / 随机字符串"
              description="快速生成测试用随机串，可自由切换字符集。"
              className={isToolVisible("random") ? "" : "hidden"}
            >
              <RandomStringTool />
            </SectionCard>

            <SectionCard
              icon={Clock3}
              title="时间戳转换"
              description="支持秒、毫秒时间戳和可解析日期串，快速换算本地时间与 ISO。"
              className={isToolVisible("timestamp") ? "" : "hidden"}
            >
              <TimestampTool />
            </SectionCard>

            <SectionCard
              icon={FileJson2}
              title="JSON 美化 / 压缩"
              description="把 JSON 变得更好读，或者压成一行方便塞进配置与请求里。"
              className={isToolVisible("json") ? "" : "hidden"}
            >
              <JsonTool />
            </SectionCard>

            <SectionCard
              icon={FileCode2}
              title="代码混淆 / 压缩"
              description="对 JavaScript 进行混淆与压缩，并支持 CSS / HTML 压缩，适合代码上线前减小体积、提高阅读门槛。"
              className={isToolVisible("code-obfuscate") ? "" : "hidden"}
            >
              <CodeObfuscateTool />
            </SectionCard>

            <SectionCard
              icon={ScanSearch}
              title="参数分析"
              description="识别 URL 查询串、表单参数或 JSON 键值，方便快速排查请求结构。"
              className={isToolVisible("params") ? "" : "hidden"}
            >
              <ParamsTool />
            </SectionCard>

            <SectionCard
              icon={ShieldAlert}
              title="敏感词快速检测"
              description="使用内置轻量词表做快速扫描，适合草稿或提交前的第一轮自查。"
              className={isToolVisible("sensitive") ? "" : "hidden"}
            >
              <SensitiveTool />
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("image-tools") && (
        <section id="image-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[1].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[1].description}
            </p>
          </div>

          {renderToolTabs("image-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={ImageIcon}
              title="Favicon 生成器"
              description="上传一张图片，本地生成 16 / 32 / 48 / 64 / 180 / 512 多种尺寸的 PNG 网站图标，并附带 <head> 引用代码。"
              className={isToolVisible("favicon") ? "" : "hidden"}
            >
              <FaviconTool />
            </SectionCard>

            <SectionCard
              icon={RefreshCcw}
              title="图片格式转换"
              description="PNG / JPG / WebP 之间互相转换，可调输出质量，转换在浏览器本地完成不上传。"
              className={isToolVisible("image-convert") ? "" : "hidden"}
            >
              <ImageConvertTool />
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="图片裁剪 / 改尺寸"
              description="按指定宽高重新缩放图片，支持锁定宽高比，导出 PNG。"
              className={isToolVisible("image-resize") ? "" : "hidden"}
            >
              <ImageResizeTool />
            </SectionCard>

            <SectionCard
              icon={Wand2}
              title="图片加水印"
              description="给图片添加文字水印，可设字号、颜色、透明度、九宫格位置或整图平铺。"
              className={isToolVisible("image-watermark") ? "" : "hidden"}
            >
              <ImageWatermarkTool />
            </SectionCard>

            <SectionCard
              icon={Sparkles}
              title="图片主色调提取"
              description="从图片中提取占比最高的主色调，生成可一键复制的配色板。"
              className={isToolVisible("color-extract") ? "" : "hidden"}
            >
              <ColorExtractTool />
            </SectionCard>

            <SectionCard
              icon={QrCode}
              title="二维码生成"
              description="输入任意文本、本地直接生成 PNG Data URL，适合链接、备注和联系方式。"
              className={isToolVisible("qrcode") ? "" : "hidden"}
            >
              <QrcodeTool />
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="图片与 Base64 互转"
              description="上传图片可转 Data URL，粘贴 Base64 也能直接预览和验证。"
              className={isToolVisible("image-base64") ? "" : "hidden"}
            >
              <ImageBase64Tool />
            </SectionCard>

            <SectionCard
              icon={FileCode2}
              title="SVG 转图片"
              description="直接粘贴 SVG 源码，本地转成 PNG 预览与下载。"
              className={isToolVisible("svg-image") ? "" : "hidden"}
            >
              <SvgToImageTool />
            </SectionCard>

            <SectionCard
              icon={Wand2}
              title="图片压缩"
              description="基于 Canvas 做本地压缩，可选 JPEG / WebP，适合发图前快速瘦身。"
              className={isToolVisible("image-compress") ? "" : "hidden"}
            >
              <ImageCompressTool />
            </SectionCard>

            <SectionCard
              icon={Swords}
              title="摸头 GIF（图片上传版）"
              description="上传头像后本地生成一个轻量简版摸头 GIF，适合做个性签名或评论区头像。"
              className={isToolVisible("pet-gif") ? "" : "hidden"}
            >
              <PetGifTool />
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("seo-geo-tools") && (
        <section id="seo-geo-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[4].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[4].description}
            </p>
          </div>

          {renderToolTabs("seo-geo-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={FileCode2}
              title="llms.txt 生成器"
              description="一款免费的 llms.txt 生成工具，可以把网站里的核心内容整理成统一的纯文本格式，让 ChatGPT、Claude、Gemini 这类模型更容易读懂、检索和引用你的信息。"
              className={isToolVisible("llms-txt") ? "" : "hidden"}
            >
              <LlmsTxtTool />
            </SectionCard>

            <SectionCard
              icon={Globe}
              title="网站流量分析"
              description="输入域名，基于 SimilarWeb 公开估算数据查看月访问量、平均时长、跳出率、全球排名、访问趋势、流量来源与主要地区分布。"
              className={isToolVisible("site-traffic") ? "" : "hidden"}
            >
              <SiteTrafficTool />
            </SectionCard>

            <SectionCard
              icon={ScanSearch}
              title="Meta 标签 / TDK 生成"
              description="填好标题、描述、关键词与社交分享信息，一键生成可直接粘贴到 <head> 的 SEO 与 Open Graph / Twitter 卡片标签。"
              className={isToolVisible("meta-tags") ? "" : "hidden"}
            >
              <MetaTagsTool />
            </SectionCard>

            <SectionCard
              icon={ScrollText}
              title="robots.txt 生成器"
              description="按 User-agent、Allow / Disallow 规则与 Sitemap 地址生成标准 robots.txt，控制搜索引擎与 AI 爬虫的抓取范围。"
              className={isToolVisible("robots-txt") ? "" : "hidden"}
            >
              <RobotsTxtTool />
            </SectionCard>

            <SectionCard
              icon={FileJson2}
              title="结构化数据 JSON-LD"
              description="生成 schema.org 结构化数据，帮助搜索引擎与 AI 更准确地理解页面，支持文章、网站与组织三种常见类型。"
              className={isToolVisible("json-ld") ? "" : "hidden"}
            >
              <JsonLdTool />
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="关键词密度分析"
              description="粘贴正文，统计字数与高频词，并可针对目标关键词计算出现次数与密度，辅助判断内容是否堆砌或覆盖不足。"
              className={isToolVisible("keyword-density") ? "" : "hidden"}
            >
              <KeywordDensityTool />
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("network-tools") && (
        <section id="network-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[2].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[2].description}
            </p>
          </div>

          {renderToolTabs("network-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={Globe}
              title="客户端 IP"
              description="读取当前请求头里的公网来源信息，适合快速确认反代和访客地址。"
              className={isToolVisible("client-ip") ? "" : "hidden"}
            >
              <ClientIpTool />
            </SectionCard>

            <SectionCard
              icon={DatabaseZap}
              title="DNS 查询"
              description="一次拉出 A、AAAA、MX、NS、TXT 等常见记录，方便排查域名解析问题。"
              className={isToolVisible("dns-lookup") ? "" : "hidden"}
            >
              <DnsLookupTool />
            </SectionCard>

            <SectionCard
              icon={Wifi}
              title="Ping（TCP 连通性）"
              description="出于运行环境限制，这里做的是 TCP connect 延迟测试，更适合排查端口可达性。"
              className={isToolVisible("ping") ? "" : "hidden"}
            >
              <PingTool />
            </SectionCard>

            <SectionCard
              icon={Network}
              title="端口扫描"
              description="支持逗号和短范围写法，如 80,443,3000-3005；为了安全，限制了端口数量和内网目标。"
              className={isToolVisible("port-scan") ? "" : "hidden"}
            >
              <PortScanTool />
            </SectionCard>

            <SectionCard
              icon={RefreshCcw}
              title="URL 状态检测"
              description="检测最终跳转地址、状态码和响应头部中的基本信息。"
              className={isToolVisible("url-status") ? "" : "hidden"}
            >
              <UrlStatusTool />
            </SectionCard>

            <SectionCard
              icon={BookOpenText}
              title="网页元数据提取"
              description="提取标题、描述、canonical、favicon 以及常见 OG / Twitter 元信息。"
              className={isToolVisible("web-metadata") ? "" : "hidden"}
            >
              <WebMetadataTool />
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="网页图片提取"
              description="列出页面中的常见图片资源，适合快速收集素材或检查首图。"
              className={isToolVisible("web-images") ? "" : "hidden"}
            >
              <WebImagesTool />
            </SectionCard>

            <SectionCard
              icon={ScrollText}
              title="网页转 Markdown"
              description="抓取页面主体内容并转成 Markdown，适合先做初稿摘录或归档。"
              className={isToolVisible("web-markdown") ? "" : "hidden"}
            >
              <WebMarkdownTool />
            </SectionCard>

          </div>
        </section>
      )}

      {isSectionVisible("public-data-tools") && (
        <section id="public-data-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[3].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[3].description}
            </p>
          </div>

          {renderToolTabs("public-data-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={Sparkles}
              title="Minecraft 玩家信息"
              description="输入用户名即可查询 Minecraft 玩家的 UUID、头像与皮肤，方便查看与展示。"
              className={isToolVisible("minecraft-player") ? "" : "hidden"}
            >
              <MinecraftPlayerTool />
            </SectionCard>

            <SectionCard
              icon={Wifi}
              title="Minecraft 服务器信息"
              description="基于 mcstatus.io 免费接口查询 Java 或 Bedrock 服务器状态。"
              className={isToolVisible("minecraft-server") ? "" : "hidden"}
            >
              <MinecraftServerTool />
            </SectionCard>

            <SectionCard
              icon={Globe}
              title="GitHub 仓库信息"
              description="解析 owner/repo 或完整仓库地址，返回 stars、forks、topics 和语言分布。"
              className={isToolVisible("github-repo") ? "" : "hidden"}
            >
              <GithubRepoTool />
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="Gravatar"
              description="输入邮箱即可本地算出 MD5，并拼出 Gravatar 头像与资料页地址。"
              className={isToolVisible("gravatar") ? "" : "hidden"}
            >
              <GravatarTool />
            </SectionCard>

            <SectionCard
              icon={MapPinned}
              title="基础 IP 归属"
              description="优先查输入的 IP，没有的话就查你当前请求来源，基于本地 GeoIP 库完成。"
              className={isToolVisible("ip-geo") ? "" : "hidden"}
            >
              <IpGeoTool />
            </SectionCard>

            <SectionCard
              icon={MapPinned}
              title="手机号归属地"
              description="使用本地号段库查询中国大陆手机号的省市和运营商，不走在线接口。"
              className={isToolVisible("mobile-area") ? "" : "hidden"}
            >
              <MobileAreaTool />
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="Bing 每日壁纸"
              description="直接拉取 Bing 当天壁纸，适合拿来做背景图、封面图或桌面收藏。"
              className={isToolVisible("bing-wallpaper") ? "" : "hidden"}
            >
              <BingWallpaperTool />
            </SectionCard>

            <SectionCard
              icon={BookOpenText}
              title="答案之书 / 诗词 / 历史今天"
              description="答案之书、随机诗词与历史上的今天，随手获取一点灵感与有趣内容。"
              className={isToolVisible("content-tools") ? "" : "hidden"}
            >
              <ContentTools />
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("calc-tools") && (
        <section id="calc-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[5].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[5].description}
            </p>
          </div>

          {renderToolTabs("calc-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={ScrollText}
              title="房贷计算器"
              description="按等额本息或等额本金计算每月月供、总利息与总还款，买房贷款前先算一笔账。"
              className={isToolVisible("loan") ? "" : "hidden"}
            >
              <LoanCalcTool />
            </SectionCard>

            <SectionCard
              icon={BookOpenText}
              title="个税计算器"
              description="输入税前月薪、五险一金与专项附加扣除，估算应缴个税与税后到手收入。"
              className={isToolVisible("income-tax") ? "" : "hidden"}
            >
              <IncomeTaxTool />
            </SectionCard>

            <SectionCard
              icon={Sparkles}
              title="BMI 计算器"
              description="输入身高体重计算身体质量指数 BMI，并按中国标准给出偏瘦 / 正常 / 超重 / 肥胖判断。"
              className={isToolVisible("bmi") ? "" : "hidden"}
            >
              <BmiTool />
            </SectionCard>

            <SectionCard
              icon={Clock3}
              title="日期间隔计算"
              description="计算两个日期之间相差的天数、周数与年月，也可用来算年龄或纪念日。"
              className={isToolVisible("date-diff") ? "" : "hidden"}
            >
              <DateDiffTool />
            </SectionCard>

            <SectionCard
              icon={RefreshCcw}
              title="单位换算"
              description="长度、重量、面积、存储与温度的常用单位互相换算。"
              className={isToolVisible("unit-convert") ? "" : "hidden"}
            >
              <UnitConvertTool />
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("cn-tools") && (
        <section id="cn-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[6].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[6].description}
            </p>
          </div>

          {renderToolTabs("cn-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={RefreshCcw}
              title="简繁体转换"
              description="简体中文与繁体中文互相转换，基于 OpenCC 词库，转换更准确自然。"
              className={isToolVisible("hanzi-convert") ? "" : "hidden"}
            >
              <HanziConvertTool />
            </SectionCard>

            <SectionCard
              icon={BookOpenText}
              title="汉字转拼音"
              description="把中文转换为拼音，支持带声调、不带声调、数字声调与首字母四种模式。"
              className={isToolVisible("pinyin") ? "" : "hidden"}
            >
              <PinyinTool />
            </SectionCard>

            <SectionCard
              icon={SquareTerminal}
              title="中文假数据生成"
              description="批量生成虚构的中文姓名、手机号、邮箱与地址，适合做测试与演示数据。"
              className={isToolVisible("chinese-faker") ? "" : "hidden"}
            >
              <ChineseFakerTool />
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("css-tools") && (
        <section id="css-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <SectionHeading className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[7].title}
            </SectionHeading>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[7].description}
            </p>
          </div>

          {renderToolTabs("css-tools")}

          <div className={sectionGridClass}>
            <SectionCard
              icon={Sparkles}
              title="CSS 渐变生成"
              description="可视化生成线性 / 径向渐变，调整角度与颜色，实时预览并复制 CSS。"
              className={isToolVisible("css-gradient") ? "" : "hidden"}
            >
              <CssGradientTool />
            </SectionCard>

            <SectionCard
              icon={Wand2}
              title="box-shadow 生成"
              description="拖动滑块调整偏移、模糊、扩散与颜色透明度，实时预览阴影并复制 CSS。"
              className={isToolVisible("box-shadow") ? "" : "hidden"}
            >
              <BoxShadowTool />
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="圆角生成"
              description="分别调节四个角的圆角大小，实时预览并复制 border-radius。"
              className={isToolVisible("border-radius") ? "" : "hidden"}
            >
              <BorderRadiusTool />
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="调色板生成"
              description="从一个主色出发，生成由浅到深的一整套色阶，点击即可复制色值。"
              className={isToolVisible("palette") ? "" : "hidden"}
            >
              <PaletteTool />
            </SectionCard>
          </div>
        </section>
      )}

      <div className="mt-14 rounded-[28px] border border-[#e6dbff] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(246,240,255,0.92))] px-6 py-6 text-sm leading-7 text-[#66568f] shadow-[0_18px_60px_rgba(91,61,245,0.06)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))] dark:text-[#c4b6eb]">
        <p>
          {footerNote.before}
          <code className="mx-1 rounded bg-[#efe8ff] px-1.5 py-0.5 text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]">
            localhost
          </code>
          {footerNote.after}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={localizedHref("/resources") as Route} className="text-[#5b3df5] hover:underline">
            {footerNote.resources}
          </Link>
          <Link href={localizedHref("/about") as Route} className="text-[#5b3df5] hover:underline">
            {footerNote.about}
          </Link>
        </div>
      </div>
    </div>
    </TranslationProvider>
  );
}
