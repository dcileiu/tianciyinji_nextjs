"use client";

import QRCode from "qrcode";
import {
  BookOpenText,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  DatabaseZap,
  Download,
  ExternalLink,
  FileCode2,
  FileJson2,
  Filter,
  Globe,
  Hash,
  ImageIcon,
  Loader2,
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
import { useDeferredValue, useEffect, useRef, useState } from "react";
import {
  SimpleDropdown,
  SimpleDropdownItem,
} from "@/components/ui/simple-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SENSITIVE_WORDS } from "@/lib/tools/content";
import { cn } from "@/lib/utils";

type ServerResultMap = Record<string, any>;
type ServerErrorMap = Record<string, string>;
type LoadingMap = Record<string, boolean>;

const sectionMeta = [
  {
    id: "local-tools",
    title: "纯本地工具",
    description:
      "不依赖外部网络，浏览器或本站服务端本地就能完成的算法和文本处理工具。",
  },
  {
    id: "image-tools",
    title: "图片处理",
    description:
      "二维码、Base64、SVG、压缩和简版摸头 GIF，都可以直接在页面里处理。",
  },
  {
    id: "network-tools",
    title: "网络基础",
    description: "面向 URL、域名、端口和网页内容的基础观测与分析能力。",
  },
  {
    id: "public-data-tools",
    title: "公开数据",
    description: "基于公开协议或免费数据源组合出来的实用信息查询工具。",
  },
] as const;

type SectionId = (typeof sectionMeta)[number]["id"];

const toolCatalog = [
  { id: "aes", title: "AES 加解密", sectionId: "local-tools" },
  { id: "base64", title: "Base64 编解码", sectionId: "local-tools" },
  { id: "md5", title: "MD5 计算与校验", sectionId: "local-tools" },
  { id: "random", title: "随机数 / 随机字符串", sectionId: "local-tools" },
  { id: "timestamp", title: "时间戳转换", sectionId: "local-tools" },
  { id: "json", title: "JSON 美化 / 压缩", sectionId: "local-tools" },
  { id: "params", title: "参数分析", sectionId: "local-tools" },
  { id: "sensitive", title: "敏感词快速检测", sectionId: "local-tools" },
  { id: "qrcode", title: "二维码生成", sectionId: "image-tools" },
  { id: "image-base64", title: "图片与 Base64 互转", sectionId: "image-tools" },
  { id: "svg-image", title: "SVG 转图片", sectionId: "image-tools" },
  { id: "image-compress", title: "图片压缩", sectionId: "image-tools" },
  { id: "pet-gif", title: "摸头 GIF（图片上传版）", sectionId: "image-tools" },
  { id: "client-ip", title: "客户端 IP", sectionId: "network-tools" },
  { id: "dns-lookup", title: "DNS 查询", sectionId: "network-tools" },
  { id: "ping", title: "Ping（TCP 连通性）", sectionId: "network-tools" },
  { id: "port-scan", title: "端口扫描", sectionId: "network-tools" },
  { id: "url-status", title: "URL 状态检测", sectionId: "network-tools" },
  { id: "web-metadata", title: "网页元数据提取", sectionId: "network-tools" },
  { id: "web-images", title: "网页图片提取", sectionId: "network-tools" },
  { id: "web-markdown", title: "网页转 Markdown", sectionId: "network-tools" },
  { id: "llms-txt", title: "llms.txt 生成器", sectionId: "network-tools" },
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
] as const satisfies ReadonlyArray<{
  id: string;
  title: string;
  sectionId: SectionId;
}>;

type ToolId = (typeof toolCatalog)[number]["id"];
type ToolFilter = "all" | ToolId;
type SectionFilter = "all" | SectionId;

const sections = sectionMeta.map((section) => ({
  ...section,
  count: toolCatalog.filter((tool) => tool.sectionId === section.id).length,
  tools: toolCatalog.filter((tool) => tool.sectionId === section.id),
}));

const inputClass =
  "w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] dark:placeholder:text-[#ae9fda] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff]";

const cardClass =
  "rounded-[28px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(247,242,255,0.92))] p-5 shadow-[0_22px_70px_rgba(91,61,245,0.08)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]";

const outputClass =
  "rounded-2xl border border-dashed border-[#d9ccff] bg-[#faf7ff] px-4 py-3 text-sm text-[#4d3f77] dark:border-[#3b2f59] dark:bg-[#181127] dark:text-[#d9ccff]";

const secondaryButtonClass =
  "rounded-full border-[#b9a3ff] bg-[#f7f1ff] text-[#4b2fd0] shadow-[0_12px_32px_rgba(91,61,245,0.12)] hover:border-[#8b6bff] hover:bg-[#eee3ff] hover:text-[#3c22c3] dark:border-[#5a4492] dark:bg-[#1d1533] dark:text-[#efe9ff] dark:hover:border-[#8b6bff] dark:hover:bg-[#291e45]";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function toStrictArrayBuffer(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function base64ToBytes(value: string) {
  const normalized = value
    .replace(/^data:[^;]+;base64,/, "")
    .replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function deriveAesKey(password: string, salt: Uint8Array) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toStrictArrayBuffer(salt),
      iterations: 120000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptAesGcm(text: string, password: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text),
  );
  return `aesgcm.${bytesToBase64(salt)}.${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptAesGcm(payload: string, password: string) {
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== "aesgcm") {
    throw new Error("密文格式不正确，应为 aesgcm.salt.iv.cipher。");
  }

  const [, saltRaw, ivRaw, cipherRaw] = parts;
  const salt = base64ToBytes(saltRaw);
  const iv = base64ToBytes(ivRaw);
  const cipher = base64ToBytes(cipherRaw);
  const key = await deriveAesKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );
  return new TextDecoder().decode(decrypted);
}

function encodeTextToBase64(text: string) {
  return bytesToBase64(new TextEncoder().encode(text));
}

function decodeBase64ToText(value: string) {
  return new TextDecoder().decode(base64ToBytes(value));
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function dataUrlByteSize(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  const padding = base64.match(/=+$/)?.[0].length || 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function parseTimestampInput(input: string) {
  const raw = input.trim();
  if (!raw) return new Date();
  if (/^\d{10}$/.test(raw)) return new Date(Number(raw) * 1000);
  if (/^\d{13}$/.test(raw)) return new Date(Number(raw));
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime()))
    throw new Error("无法识别这个时间戳或日期。");
  return parsed;
}

function analyzeParameters(input: string) {
  const raw = input.trim();
  if (!raw)
    return {
      entries: [],
      summary: { total: 0, duplicates: 0 },
      pathname: "",
      hash: "",
    };

  let params: URLSearchParams;
  let pathname = "";
  let hash = "";

  if (raw.includes("://")) {
    const url = new URL(raw);
    params = new URLSearchParams(url.search);
    pathname = url.pathname;
    hash = url.hash;
  } else if (raw.startsWith("{")) {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const entries = Object.entries(parsed).map(([key, value]) => ({
      key,
      values: [typeof value === "string" ? value : JSON.stringify(value)],
    }));
    return {
      entries,
      summary: {
        total: entries.length,
        duplicates: 0,
      },
      pathname: "",
      hash: "",
    };
  } else {
    params = new URLSearchParams(raw.startsWith("?") ? raw.slice(1) : raw);
  }

  const grouped = new Map<string, string[]>();
  params.forEach((value, key) => {
    const values = grouped.get(key) || [];
    values.push(value);
    grouped.set(key, values);
  });

  const entries = Array.from(grouped.entries()).map(([key, values]) => ({
    key,
    values,
  }));
  return {
    entries,
    summary: {
      total: entries.length,
      duplicates: entries.filter((item) => item.values.length > 1).length,
    },
    pathname,
    hash,
  };
}

function detectSensitiveWords(input: string) {
  const text = input.trim();
  if (!text) return [];
  return SENSITIVE_WORDS.map((word) => {
    const count = text.split(word).length - 1;
    return count > 0 ? { word, count } : null;
  }).filter(Boolean) as Array<{ word: string; count: number }>;
}

function generateRandomString(length: number, alphabet: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取文件失败。"));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败。"));
    image.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawPetHand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.16);
  ctx.fillStyle = "#fffefc";
  ctx.shadowColor = "rgba(0,0,0,0.16)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;

  drawRoundedRect(ctx, 0, 18, width * 0.42, height * 0.52, 16);
  ctx.fill();

  drawRoundedRect(ctx, width * 0.14, 0, width * 0.22, height * 0.28, 12);
  ctx.fill();
  drawRoundedRect(ctx, width * 0.26, 2, width * 0.2, height * 0.26, 11);
  ctx.fill();
  drawRoundedRect(ctx, width * 0.37, 6, width * 0.18, height * 0.24, 10);
  ctx.fill();
  drawRoundedRect(ctx, width * 0.47, 12, width * 0.16, height * 0.22, 10);
  ctx.fill();

  drawRoundedRect(
    ctx,
    width * 0.38,
    height * 0.3,
    width * 0.42,
    height * 0.16,
    10,
  );
  ctx.fill();
  ctx.restore();
}

async function generatePetGifFromDataUrl(dataUrl: string) {
  const [{ GIFEncoder, quantize, applyPalette }, sourceImage] =
    await Promise.all([import("gifenc"), loadImageElement(dataUrl)]);
  const width = 220;
  const height = 220;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法初始化画布。");

  const gif = GIFEncoder();
  const frameOffsets = [-6, -2, 2, 6, 4, 1, -1, -4, -2, 2];

  for (const offset of frameOffsets) {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(110, 138 + offset * 0.3);
    ctx.scale(1.02, 0.98 - Math.max(offset, 0) * 0.01);
    drawRoundedRect(ctx, -52, -52, 104, 104, 26);
    ctx.clip();
    ctx.drawImage(sourceImage, -52, -52, 104, 104);
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.ellipse(110, 190, 42, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    drawPetHand(ctx, 114, 34 + offset, 92, 86);

    const imageData = ctx.getImageData(0, 0, width, height);
    const palette = quantize(imageData.data, 256, {
      format: "rgba4444",
      oneBitAlpha: true,
      clearAlpha: true,
    });
    const index = applyPalette(imageData.data, palette, "rgba4444");
    const transparentIndex = palette.findIndex(
      (color: number[]) => color[3] === 0,
    );
    gif.writeFrame(index, width, height, {
      palette,
      delay: 80,
      repeat: 0,
      dispose: 2,
      transparent: transparentIndex >= 0,
      transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
    });
  }

  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`${cardClass} ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff]">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#6c5b98] dark:text-[#b9aadf]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </article>
  );
}

function OutputBox({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${outputClass} ${className}`}>{children}</div>;
}

function downloadPlainText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
}

function FancySelect<T extends string>({
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
            "rounded-2xl px-3 py-2.5 text-[#2f2154] dark:text-[#f4efff]",
            option.value === value
              ? "bg-[#ece3ff] text-[#4f31d7] dark:bg-[#2b1f43] dark:text-[#efe9ff]"
              : "hover:text-[#4f31d7] dark:hover:text-[#ffffff]",
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

function FancyCheckbox({
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
        "group flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2.5 transition select-none",
        checked
          ? "border-[#b69cff] bg-[linear-gradient(135deg,rgba(240,231,255,0.96),rgba(234,224,255,0.88))] text-[#4327ba] shadow-[0_14px_36px_rgba(91,61,245,0.12)] dark:border-[#7454cf] dark:bg-[linear-gradient(135deg,rgba(40,28,69,0.94),rgba(31,22,53,0.9))] dark:text-[#f2edff]"
          : "border-[#ded2ff] bg-white/55 text-[#5e4f8a] hover:border-[#b99fff] hover:bg-[#f7f2ff] dark:border-[#382d55] dark:bg-white/[0.03] dark:text-[#cbbff0] dark:hover:border-[#7156c8] dark:hover:bg-white/[0.05]",
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
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[8px] border transition",
          checked
            ? "border-[#6d46ff] bg-[#5b3df5] text-white shadow-[0_8px_18px_rgba(91,61,245,0.24)] dark:border-[#a58eff] dark:bg-[#8e72ff]"
            : "border-[#bfaeff] bg-white/90 text-transparent dark:border-[#54407f] dark:bg-[#1a132d]",
        )}
      >
        <Check
          className={cn(
            "h-3.5 w-3.5 transition",
            checked ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

export default function ToolsClientPage() {
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({});
  const [serverResults, setServerResults] = useState<ServerResultMap>({});
  const [serverErrors, setServerErrors] = useState<ServerErrorMap>({});
  const [selectedTool, setSelectedTool] = useState<ToolFilter>("all");
  const [selectedSection, setSelectedSection] = useState<SectionFilter>("all");

  const [aesMode, setAesMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [aesText, setAesText] = useState("");
  const [aesPassword, setAesPassword] = useState("");
  const [aesOutput, setAesOutput] = useState("");
  const [aesError, setAesError] = useState("");

  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [base64Error, setBase64Error] = useState("");

  const [md5Text, setMd5Text] = useState("");
  const [md5Expected, setMd5Expected] = useState("");

  const [randomLength, setRandomLength] = useState("16");
  const [randomValue, setRandomValue] = useState("");
  const [randomIncludeUppercase, setRandomIncludeUppercase] = useState(true);
  const [randomIncludeLowercase, setRandomIncludeLowercase] = useState(true);
  const [randomIncludeNumbers, setRandomIncludeNumbers] = useState(true);
  const [randomIncludeSymbols, setRandomIncludeSymbols] = useState(false);

  const [timestampInput, setTimestampInput] = useState(String(Date.now()));
  const [timestampOutput, setTimestampOutput] = useState<{
    local: string;
    iso: string;
    seconds: number;
    milliseconds: number;
  } | null>(null);
  const [timestampError, setTimestampError] = useState("");

  const [jsonInput, setJsonInput] = useState(
    '{\n  "name": "Dci",\n  "stack": ["Next.js", "TypeScript"]\n}',
  );
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonError, setJsonError] = useState("");

  const [paramsInput, setParamsInput] = useState(
    "https://example.com/search?q=blog&tag=next&tag=tools",
  );
  const [paramsResult, setParamsResult] = useState<{
    entries: Array<{ key: string; values: string[] }>;
    summary: { total: number; duplicates: number };
    pathname: string;
    hash: string;
  } | null>(null);
  const [paramsError, setParamsError] = useState("");

  const [sensitiveInput, setSensitiveInput] = useState("");
  const deferredSensitiveInput = useDeferredValue(sensitiveInput);

  const [qrText, setQrText] = useState("https://github.com/dcileiu");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState("");

  const [imageBase64Value, setImageBase64Value] = useState("");
  const [imageBase64Preview, setImageBase64Preview] = useState("");
  const [imageBase64Info, setImageBase64Info] = useState<{
    name?: string;
    size?: number;
  } | null>(null);
  const [imageBase64Error, setImageBase64Error] = useState("");

  const [svgInput, setSvgInput] = useState(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="32" fill="#2e2150"/><path d="M52 24h46l-8 68H44l8-68Z" fill="#fff"/><path d="M90 80h52l-6 28H84l6-28Z" fill="#d9ccff"/></svg>',
  );
  const [svgPngUrl, setSvgPngUrl] = useState("");
  const [svgError, setSvgError] = useState("");

  const [compressDataUrl, setCompressDataUrl] = useState("");
  const [compressInfo, setCompressInfo] = useState<{
    before: number;
    after: number;
    type: string;
  } | null>(null);
  const [compressError, setCompressError] = useState("");
  const [compressQuality, setCompressQuality] = useState("0.78");
  const [compressMaxWidth, setCompressMaxWidth] = useState("1600");
  const [compressType, setCompressType] = useState<"image/jpeg" | "image/webp">(
    "image/webp",
  );

  const [petGifUrl, setPetGifUrl] = useState("");
  const [petGifError, setPetGifError] = useState("");
  const [petGifBusy, setPetGifBusy] = useState(false);
  const petGifObjectUrlRef = useRef<string | null>(null);

  const [dnsHost, setDnsHost] = useState("openai.com");
  const [pingHost, setPingHost] = useState("openai.com");
  const [pingPort, setPingPort] = useState("443");
  const [portHost, setPortHost] = useState("openai.com");
  const [portExpression, setPortExpression] = useState("80,443,3000-3002");
  const [urlStatusInput, setUrlStatusInput] = useState("https://openai.com");
  const [metadataUrlInput, setMetadataUrlInput] =
    useState("https://openai.com");
  const [imageExtractUrlInput, setImageExtractUrlInput] =
    useState("https://openai.com");
  const [markdownUrlInput, setMarkdownUrlInput] =
    useState("https://openai.com");
  const [llmsUrlInput, setLlmsUrlInput] = useState("https://itianci.cn");
  const [copiedTool, setCopiedTool] = useState("");

  const [minecraftPlayerInput, setMinecraftPlayerInput] = useState("Notch");
  const [minecraftServerInput, setMinecraftServerInput] =
    useState("mc.hypixel.net");
  const [minecraftEdition, setMinecraftEdition] = useState<"java" | "bedrock">(
    "java",
  );
  const [githubRepoInput, setGithubRepoInput] = useState("vercel/next.js");
  const [gravatarEmail, setGravatarEmail] = useState("dcileiu@outlook.com");
  const [geoIpInput, setGeoIpInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("13800138000");
  const [bingMarket, setBingMarket] = useState("zh-CN");
  const [answerQuestion, setAnswerQuestion] =
    useState("我该不该继续把这个博客做成长期项目？");
  const [historyMonth, setHistoryMonth] = useState(
    String(new Date().getMonth() + 1),
  );
  const [historyDay, setHistoryDay] = useState(String(new Date().getDate()));

  useEffect(() => {
    return () => {
      if (petGifObjectUrlRef.current) {
        URL.revokeObjectURL(petGifObjectUrlRef.current);
      }
    };
  }, []);

  const sensitiveMatches = detectSensitiveWords(deferredSensitiveInput);
  const activeTool =
    selectedTool === "all"
      ? null
      : toolCatalog.find((tool) => tool.id === selectedTool) || null;
  const activeSection =
    selectedTool !== "all"
      ? sections.find((section) => section.id === activeTool?.sectionId) || null
      : selectedSection === "all"
        ? null
        : sections.find((section) => section.id === selectedSection) || null;
  const isToolVisible = (toolId: ToolId) =>
    selectedTool === "all" || selectedTool === toolId;
  const isSectionVisible = (sectionId: SectionId) =>
    selectedTool !== "all"
      ? activeTool?.sectionId === sectionId
      : selectedSection === "all" || selectedSection === sectionId;

  async function runServerTool(
    tool: string,
    payload?: Record<string, unknown>,
  ) {
    setLoadingMap((current) => ({ ...current, [tool]: true }));
    setServerErrors((current) => ({ ...current, [tool]: "" }));

    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tool, payload }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "请求失败。");
      }
      setServerResults((current) => ({ ...current, [tool]: data.data }));
      return data.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : "请求失败。";
      setServerErrors((current) => ({ ...current, [tool]: message }));
      return null;
    } finally {
      setLoadingMap((current) => ({ ...current, [tool]: false }));
    }
  }

  async function copyGeneratedText(tool: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTool(tool);
      window.setTimeout(() => {
        setCopiedTool((current) => (current === tool ? "" : current));
      }, 1800);
    } catch {
      setServerErrors((current) => ({
        ...current,
        [tool]: "复制失败，请手动选中文本复制。",
      }));
    }
  }

  async function handleAesSubmit() {
    setAesError("");
    setAesOutput("");
    try {
      if (!aesText.trim())
        throw new Error(
          aesMode === "encrypt"
            ? "请输入要加密的内容。"
            : "请输入要解密的密文。",
        );
      if (!aesPassword.trim()) throw new Error("请输入密码。");
      const result =
        aesMode === "encrypt"
          ? await encryptAesGcm(aesText, aesPassword)
          : await decryptAesGcm(aesText, aesPassword);
      setAesOutput(result);
    } catch (error) {
      setAesError(error instanceof Error ? error.message : "AES 处理失败。");
    }
  }

  function handleBase64Encode() {
    setBase64Error("");
    try {
      setBase64Output(encodeTextToBase64(base64Input));
    } catch (error) {
      setBase64Error(
        error instanceof Error ? error.message : "Base64 编码失败。",
      );
    }
  }

  function handleBase64Decode() {
    setBase64Error("");
    try {
      setBase64Output(decodeBase64ToText(base64Input));
    } catch (error) {
      setBase64Error(
        error instanceof Error
          ? error.message
          : "Base64 解码失败，请检查输入。",
      );
    }
  }

  function handleRandomGenerate() {
    const length = Number(randomLength);
    let alphabet = "";
    if (randomIncludeUppercase) alphabet += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (randomIncludeLowercase) alphabet += "abcdefghijklmnopqrstuvwxyz";
    if (randomIncludeNumbers) alphabet += "0123456789";
    if (randomIncludeSymbols) alphabet += "!@#$%^&*_-+=?";
    if (!alphabet) {
      setRandomValue("请至少勾选一种字符集。");
      return;
    }
    if (!Number.isInteger(length) || length <= 0 || length > 256) {
      setRandomValue("长度需在 1 到 256 之间。");
      return;
    }
    setRandomValue(generateRandomString(length, alphabet));
  }

  function handleTimestampConvert() {
    setTimestampError("");
    try {
      const date = parseTimestampInput(timestampInput);
      setTimestampOutput({
        local: date.toLocaleString("zh-CN", { hour12: false }),
        iso: date.toISOString(),
        seconds: Math.floor(date.getTime() / 1000),
        milliseconds: date.getTime(),
      });
    } catch (error) {
      setTimestampError(error instanceof Error ? error.message : "转换失败。");
    }
  }

  function handleJsonBeautify(compact = false) {
    setJsonError("");
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(
        compact ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2),
      );
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : "JSON 解析失败。");
    }
  }

  function handleParamsAnalyze() {
    setParamsError("");
    try {
      setParamsResult(analyzeParameters(paramsInput));
    } catch (error) {
      setParamsError(error instanceof Error ? error.message : "参数分析失败。");
    }
  }

  async function handleQrGenerate() {
    setQrError("");
    try {
      if (!qrText.trim()) throw new Error("请输入二维码内容。");
      const url = await QRCode.toDataURL(qrText, {
        width: 360,
        margin: 1,
        color: {
          dark: "#2e2150",
          light: "#0000",
        },
      });
      setQrDataUrl(url);
    } catch (error) {
      setQrError(error instanceof Error ? error.message : "二维码生成失败。");
    }
  }

  async function handleImageFileToBase64(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageBase64Error("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageBase64Value(dataUrl);
      setImageBase64Preview(dataUrl);
      setImageBase64Info({ name: file.name, size: file.size });
    } catch (error) {
      setImageBase64Error(
        error instanceof Error ? error.message : "图片读取失败。",
      );
    }
  }

  function handleBase64ToImagePreview() {
    setImageBase64Error("");
    try {
      if (!imageBase64Value.trim()) throw new Error("请输入 Base64 内容。");
      const normalized = imageBase64Value.startsWith("data:")
        ? imageBase64Value
        : `data:image/png;base64,${imageBase64Value.replace(/\s+/g, "")}`;
      base64ToBytes(normalized);
      setImageBase64Preview(normalized);
      setImageBase64Info({ size: dataUrlByteSize(normalized) });
    } catch (error) {
      setImageBase64Error(
        error instanceof Error ? error.message : "Base64 图片内容无效。",
      );
    }
  }

  async function handleSvgConvert() {
    setSvgError("");
    try {
      if (!svgInput.includes("<svg"))
        throw new Error("请输入完整的 SVG 代码。");
      const svgBlob = new Blob([svgInput], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      const image = await loadImageElement(url);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 512;
      canvas.height = image.naturalHeight || 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法初始化画布。");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      setSvgPngUrl(canvas.toDataURL("image/png"));
      URL.revokeObjectURL(url);
    } catch (error) {
      setSvgError(error instanceof Error ? error.message : "SVG 转图片失败。");
    }
  }

  async function handleCompressImage(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompressError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const image = await loadImageElement(dataUrl);
      const maxWidth = Math.max(320, Number(compressMaxWidth) || 1600);
      const quality = Math.min(
        Math.max(Number(compressQuality) || 0.78, 0.3),
        0.95,
      );
      const scale = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法初始化画布。");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const compressed = canvas.toDataURL(compressType, quality);
      setCompressDataUrl(compressed);
      setCompressInfo({
        before: file.size,
        after: dataUrlByteSize(compressed),
        type: compressType,
      });
    } catch (error) {
      setCompressError(
        error instanceof Error ? error.message : "图片压缩失败。",
      );
    }
  }

  async function handleGeneratePetGif(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPetGifBusy(true);
    setPetGifError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const blob = await generatePetGifFromDataUrl(dataUrl);
      if (petGifObjectUrlRef.current)
        URL.revokeObjectURL(petGifObjectUrlRef.current);
      const objectUrl = URL.createObjectURL(blob);
      petGifObjectUrlRef.current = objectUrl;
      setPetGifUrl(objectUrl);
    } catch (error) {
      setPetGifError(
        error instanceof Error ? error.message : "摸头 GIF 生成失败。",
      );
    } finally {
      setPetGifBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-20">
      <header className="relative overflow-hidden rounded-[34px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,237,255,0.94))] px-6 py-8 shadow-[0_24px_80px_rgba(91,61,245,0.10)] sm:px-8 sm:py-10 md:px-10 md:py-12 dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(130,96,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(218,208,255,0.18),transparent_30%)]" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7f71ab] dark:text-[#ab9cd8]">
            Tools Menu
          </p>
          <div className="mt-4">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-semibold tracking-tight text-[#2e2150] sm:text-4xl md:text-5xl dark:text-[#f4efff]">
                给博客加一套真正能用的工具箱
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#66568f] sm:text-base dark:text-[#c4b6eb]">
                这里把纯本地算法、图片处理、网络基础探测和公开数据接口都收成了一页工具菜单。偏隐私的内容尽量本地完成，偏网络的能力统一走
                <code className="mx-1 rounded bg-[#efe8ff] px-1.5 py-0.5 text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]">
                  /api/tools
                </code>
                ，后续你继续加新工具也会比较顺手。
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[26px] border border-[#ddd0ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(247,242,255,0.55))] p-4 shadow-[0_18px_55px_rgba(91,61,245,0.08)] dark:border-[#32274d] dark:bg-[linear-gradient(135deg,rgba(27,20,45,0.85),rgba(18,13,31,0.92))] sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#7f71ab] dark:text-[#ab9cd8]">
                  <Filter className="h-3.5 w-3.5" />
                  Tool Picker
                </div>
                <p className="mt-2 text-sm leading-7 text-[#65558e] dark:text-[#c4b6eb]">
                  默认展示全部工具卡片；点选某个工具名后，会聚焦只显示这一张卡片。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1 text-xs text-[#6b5b97] dark:border-[#3a2f58] dark:bg-white/[0.05] dark:text-[#c7baf1]">
                  {selectedTool !== "all"
                    ? `当前聚焦：${activeTool?.title || ""}`
                    : selectedSection !== "all"
                      ? `当前分类：${activeSection?.title || ""} · ${activeSection?.count || 0} 张工具卡片`
                      : `当前显示全部 ${toolCatalog.length} 张工具卡片`}
                </span>
                {(selectedTool !== "all" || selectedSection !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTool("all");
                      setSelectedSection("all");
                    }}
                    className="rounded-full bg-[#5b3df5] px-3.5 py-2 text-sm text-white transition hover:bg-[#4f31d7]"
                  >
                    恢复全部
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedTool("all");
                  setSelectedSection("all");
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  selectedTool === "all" && selectedSection === "all"
                    ? "border-[#5b3df5] bg-[#5b3df5] text-white shadow-[0_12px_30px_rgba(91,61,245,0.22)]"
                    : "border-[#d9ccff] bg-white/75 text-[#5c4a88] hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#362b53] dark:bg-white/[0.04] dark:text-[#d2c6f3]",
                )}
              >
                全部工具
              </button>
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setSelectedTool("all");
                    setSelectedSection(section.id);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                    selectedTool === "all" && selectedSection === section.id
                      ? "border-[#5b3df5] bg-[#5b3df5] text-white shadow-[0_12px_30px_rgba(91,61,245,0.22)]"
                      : "border-[#d9ccff] bg-white/75 text-[#5c4a88] hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#362b53] dark:bg-white/[0.04] dark:text-[#d2c6f3]",
                  )}
                >
                  <span>{section.title}</span>
                  <span
                    className={cn(
                      "inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
                      selectedTool === "all" && selectedSection === section.id
                        ? "bg-white/18 text-white"
                        : "bg-[#efe6ff] text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#efe9ff]",
                    )}
                  >
                    {section.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {sections.filter((section) => isSectionVisible(section.id)).map((section) => (
                <div
                  key={section.id}
                  className="rounded-[22px] border border-[#e4d8ff] bg-white/60 p-4 dark:border-[#302646] dark:bg-white/[0.04]"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#312355] dark:text-[#f4efff]">
                      {section.title}
                    </div>
                    <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                      {section.count} 个工具
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.tools.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          setSelectedTool(tool.id);
                          setSelectedSection(section.id);
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition sm:text-sm",
                          selectedTool === tool.id
                            ? "border-[#5b3df5] bg-[#ece3ff] text-[#4f31d7] shadow-[0_8px_20px_rgba(91,61,245,0.14)] dark:border-[#8b6bff] dark:bg-[#2b1f43] dark:text-[#efe9ff]"
                            : "border-[#ddd0ff] bg-white/70 text-[#5f4e89] hover:border-[#b695ff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#cabbef]",
                        )}
                      >
                        {tool.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {isSectionVisible("local-tools") && (
        <section id="local-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[0].title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[0].description}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              icon={ShieldAlert}
              title="AES 加解密"
              description="使用浏览器内建的 Web Crypto 实现 AES-GCM，本地完成，不上传明文。"
              className={isToolVisible("aes") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAesMode("encrypt")}
                    className={`rounded-full px-4 py-2 text-sm transition ${aesMode === "encrypt" ? "bg-[#5b3df5] text-white" : "bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]"}`}
                  >
                    加密
                  </button>
                  <button
                    onClick={() => setAesMode("decrypt")}
                    className={`rounded-full px-4 py-2 text-sm transition ${aesMode === "decrypt" ? "bg-[#5b3df5] text-white" : "bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]"}`}
                  >
                    解密
                  </button>
                </div>
                <textarea
                  className={`${inputClass} min-h-[132px] resize-y`}
                  value={aesText}
                  onChange={(event) => setAesText(event.target.value)}
                  placeholder={
                    aesMode === "encrypt"
                      ? "输入要加密的文本"
                      : "粘贴 aesgcm.salt.iv.cipher 格式密文"
                  }
                />
                <Input
                  className={inputClass}
                  type="password"
                  value={aesPassword}
                  onChange={(event) => setAesPassword(event.target.value)}
                  placeholder="输入密码"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleAesSubmit}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    立即处理
                  </Button>
                </div>
                {aesError && <OutputBox>{aesError}</OutputBox>}
                {aesOutput && (
                  <OutputBox>
                    <pre className="whitespace-pre-wrap break-all">
                      {aesOutput}
                    </pre>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={SquareTerminal}
              title="Base64 编解码"
              description="支持 Unicode 文本安全编码，也可直接拿来测试接口参数。"
              className={isToolVisible("base64") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[132px] resize-y`}
                  value={base64Input}
                  onChange={(event) => setBase64Input(event.target.value)}
                  placeholder="输入文本或 Base64 内容"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleBase64Encode}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    编码
                  </Button>
                  <Button
                    onClick={handleBase64Decode}
                    variant="outline"
                    className={secondaryButtonClass}
                  >
                    解码
                  </Button>
                </div>
                {base64Error && <OutputBox>{base64Error}</OutputBox>}
                {base64Output && (
                  <OutputBox>
                    <pre className="whitespace-pre-wrap break-all">
                      {base64Output}
                    </pre>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="MD5 计算与校验"
              description="服务端本地计算 MD5，可选输入目标哈希做快速校验。"
              className={isToolVisible("md5") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[118px] resize-y`}
                  value={md5Text}
                  onChange={(event) => setMd5Text(event.target.value)}
                  placeholder="输入待计算文本"
                />
                <Input
                  className={inputClass}
                  value={md5Expected}
                  onChange={(event) => setMd5Expected(event.target.value)}
                  placeholder="可选：输入预期 MD5 做比对"
                />
                <Button
                  onClick={() =>
                    runServerTool("md5", {
                      text: md5Text,
                      expected: md5Expected,
                    })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap.md5 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "计算 MD5"
                  )}
                </Button>
                {serverErrors.md5 && <OutputBox>{serverErrors.md5}</OutputBox>}
                {serverResults.md5 && (
                  <OutputBox>
                    <div className="space-y-2">
                      <div className="break-all font-mono">
                        {serverResults.md5.hash}
                      </div>
                      {serverResults.md5.matches !== null && (
                        <div>
                          {serverResults.md5.matches
                            ? "与预期哈希一致。"
                            : "与预期哈希不一致。"}
                        </div>
                      )}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Sparkles}
              title="随机数 / 随机字符串"
              description="快速生成测试用随机串，可自由切换字符集。"
              className={isToolVisible("random") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={randomLength}
                  onChange={(event) => setRandomLength(event.target.value)}
                  placeholder="长度，例如 16"
                />
                <div className="grid grid-cols-2 gap-3">
                  <FancyCheckbox
                    checked={randomIncludeUppercase}
                    onChange={setRandomIncludeUppercase}
                    label="大写字母"
                  />
                  <FancyCheckbox
                    checked={randomIncludeLowercase}
                    onChange={setRandomIncludeLowercase}
                    label="小写字母"
                  />
                  <FancyCheckbox
                    checked={randomIncludeNumbers}
                    onChange={setRandomIncludeNumbers}
                    label="数字"
                  />
                  <FancyCheckbox
                    checked={randomIncludeSymbols}
                    onChange={setRandomIncludeSymbols}
                    label="符号"
                  />
                </div>
                <Button
                  onClick={handleRandomGenerate}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  生成随机串
                </Button>
                {randomValue && (
                  <OutputBox>
                    <div className="break-all font-mono">{randomValue}</div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Clock3}
              title="时间戳转换"
              description="支持秒、毫秒时间戳和可解析日期串，快速换算本地时间与 ISO。"
              className={isToolVisible("timestamp") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={timestampInput}
                  onChange={(event) => setTimestampInput(event.target.value)}
                  placeholder="例如 1715664000000 或 2026-05-14 12:00:00"
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleTimestampConvert}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    转换
                  </Button>
                  <Button
                    onClick={() => setTimestampInput(String(Date.now()))}
                    variant="outline"
                    className={secondaryButtonClass}
                  >
                    使用当前时间
                  </Button>
                </div>
                {timestampError && <OutputBox>{timestampError}</OutputBox>}
                {timestampOutput && (
                  <OutputBox>
                    <div className="space-y-2">
                      <div>本地时间：{timestampOutput.local}</div>
                      <div>ISO：{timestampOutput.iso}</div>
                      <div>秒：{timestampOutput.seconds}</div>
                      <div>毫秒：{timestampOutput.milliseconds}</div>
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={FileJson2}
              title="JSON 美化 / 压缩"
              description="把 JSON 变得更好读，或者压成一行方便塞进配置与请求里。"
              className={isToolVisible("json") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[180px] resize-y font-mono`}
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => handleJsonBeautify(false)}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    美化
                  </Button>
                  <Button
                    onClick={() => handleJsonBeautify(true)}
                    variant="outline"
                    className={secondaryButtonClass}
                  >
                    压缩
                  </Button>
                </div>
                {jsonError && <OutputBox>{jsonError}</OutputBox>}
                {jsonOutput && (
                  <OutputBox>
                    <pre className="whitespace-pre-wrap break-all font-mono">
                      {jsonOutput}
                    </pre>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={ScanSearch}
              title="参数分析"
              description="识别 URL 查询串、表单参数或 JSON 键值，方便快速排查请求结构。"
              className={isToolVisible("params") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[148px] resize-y`}
                  value={paramsInput}
                  onChange={(event) => setParamsInput(event.target.value)}
                  placeholder="粘贴完整 URL、a=1&b=2 或 JSON"
                />
                <Button
                  onClick={handleParamsAnalyze}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  解析参数
                </Button>
                {paramsError && <OutputBox>{paramsError}</OutputBox>}
                {paramsResult && (
                  <OutputBox className="space-y-3">
                    {(paramsResult.pathname || paramsResult.hash) && (
                      <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                        路径：{paramsResult.pathname || "/"}{" "}
                        {paramsResult.hash
                          ? `| 哈希：${paramsResult.hash}`
                          : ""}
                      </div>
                    )}
                    <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                      共 {paramsResult.summary.total} 个字段，重复键{" "}
                      {paramsResult.summary.duplicates} 个
                    </div>
                    <div className="space-y-2">
                      {paramsResult.entries.map((entry) => (
                        <div
                          key={entry.key}
                          className="rounded-xl border border-[#e3d7ff] bg-white/60 px-3 py-2 dark:border-[#34294f] dark:bg-white/[0.03]"
                        >
                          <div className="font-medium text-[#3d2d67] dark:text-[#efe9ff]">
                            {entry.key}
                          </div>
                          <div className="mt-1 break-all text-sm text-[#685890] dark:text-[#c5b8ea]">
                            {entry.values.join(" | ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={ShieldAlert}
              title="敏感词快速检测"
              description="使用内置轻量词表做快速扫描，适合草稿或提交前的第一轮自查。"
              className={isToolVisible("sensitive") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[164px] resize-y`}
                  value={sensitiveInput}
                  onChange={(event) => setSensitiveInput(event.target.value)}
                  placeholder="把要检测的文本贴进来"
                />
                <OutputBox>
                  {sensitiveMatches.length === 0 ? (
                    <div>当前没有命中内置词表。</div>
                  ) : (
                    <div className="space-y-2">
                      <div>命中 {sensitiveMatches.length} 个词条：</div>
                      <div className="flex flex-wrap gap-2">
                        {sensitiveMatches.map((item) => (
                          <span
                            key={item.word}
                            className="rounded-full bg-[#f1eaff] px-3 py-1 text-xs text-[#5b3df5] dark:bg-[#241739] dark:text-[#d9ccff]"
                          >
                            {item.word} × {item.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </OutputBox>
              </div>
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("image-tools") && (
        <section id="image-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[1].title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[1].description}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              icon={QrCode}
              title="二维码生成"
              description="输入任意文本、本地直接生成 PNG Data URL，适合链接、备注和联系方式。"
              className={isToolVisible("qrcode") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  value={qrText}
                  onChange={(event) => setQrText(event.target.value)}
                  placeholder="输入二维码内容"
                />
                <Button
                  onClick={handleQrGenerate}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  生成二维码
                </Button>
                {qrError && <OutputBox>{qrError}</OutputBox>}
                {qrDataUrl && (
                  <OutputBox className="space-y-3 text-center">
                    <img
                      src={qrDataUrl}
                      alt="QR code"
                      className="mx-auto h-44 w-44 rounded-2xl border border-[#e3d7ff] bg-white p-3"
                    />
                    <a
                      href={qrDataUrl}
                      download="dci-qrcode.png"
                      className="text-sm text-[#5b3df5] hover:underline"
                    >
                      下载 PNG
                    </a>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="图片与 Base64 互转"
              description="上传图片可转 Data URL，粘贴 Base64 也能直接预览和验证。"
              className={isToolVisible("image-base64") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileToBase64}
                  className="text-sm text-[#6c5b98] dark:text-[#b9aadf]"
                />
                <textarea
                  className={`${inputClass} min-h-[150px] resize-y font-mono`}
                  value={imageBase64Value}
                  onChange={(event) => setImageBase64Value(event.target.value)}
                  placeholder="这里会显示图片 Base64，也可以直接粘贴现成的 Base64"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleBase64ToImagePreview}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    解析并预览
                  </Button>
                </div>
                {imageBase64Error && <OutputBox>{imageBase64Error}</OutputBox>}
                {imageBase64Preview && (
                  <OutputBox className="space-y-3">
                    {imageBase64Info && (
                      <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                        {imageBase64Info.name
                          ? `${imageBase64Info.name} · `
                          : ""}
                        {imageBase64Info.size
                          ? formatBytes(imageBase64Info.size)
                          : ""}
                      </div>
                    )}
                    <img
                      src={imageBase64Preview}
                      alt="Base64 preview"
                      className="max-h-64 rounded-2xl border border-[#e3d7ff] bg-white object-contain p-2"
                    />
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={FileCode2}
              title="SVG 转图片"
              description="直接粘贴 SVG 源码，本地转成 PNG 预览与下载。"
              className={isToolVisible("svg-image") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <textarea
                  className={`${inputClass} min-h-[200px] resize-y font-mono text-xs`}
                  value={svgInput}
                  onChange={(event) => setSvgInput(event.target.value)}
                />
                <Button
                  onClick={handleSvgConvert}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  转成 PNG
                </Button>
                {svgError && <OutputBox>{svgError}</OutputBox>}
                {svgPngUrl && (
                  <OutputBox className="space-y-3 text-center">
                    <img
                      src={svgPngUrl}
                      alt="SVG to PNG result"
                      className="mx-auto max-h-64 rounded-2xl border border-[#e3d7ff] bg-white p-3"
                    />
                    <a
                      href={svgPngUrl}
                      download="converted-from-svg.png"
                      className="text-sm text-[#5b3df5] hover:underline"
                    >
                      下载 PNG
                    </a>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Wand2}
              title="图片压缩"
              description="基于 Canvas 做本地压缩，可选 JPEG / WebP，适合发图前快速瘦身。"
              className={isToolVisible("image-compress") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCompressImage}
                  className="text-sm text-[#6c5b98] dark:text-[#b9aadf]"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    className={inputClass}
                    value={compressQuality}
                    onChange={(event) => setCompressQuality(event.target.value)}
                    placeholder="质量 0~1"
                  />
                  <Input
                    className={inputClass}
                    value={compressMaxWidth}
                    onChange={(event) =>
                      setCompressMaxWidth(event.target.value)
                    }
                    placeholder="最大宽度"
                  />
                  <FancySelect
                    value={compressType}
                    onChange={setCompressType}
                    ariaLabel="选择压缩格式"
                    options={[
                      { value: "image/webp", label: "WebP" },
                      { value: "image/jpeg", label: "JPEG" },
                    ]}
                  />
                </div>
                {compressError && <OutputBox>{compressError}</OutputBox>}
                {compressDataUrl && compressInfo && (
                  <OutputBox className="space-y-3">
                    <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                      压缩前 {formatBytes(compressInfo.before)} · 压缩后{" "}
                      {formatBytes(compressInfo.after)} · 输出{" "}
                      {compressInfo.type}
                    </div>
                    <img
                      src={compressDataUrl}
                      alt="Compressed result"
                      className="max-h-72 rounded-2xl border border-[#e3d7ff] bg-white object-contain p-2"
                    />
                    <a
                      href={compressDataUrl}
                      download={`compressed.${compressType === "image/webp" ? "webp" : "jpg"}`}
                      className="text-sm text-[#5b3df5] hover:underline"
                    >
                      下载压缩图
                    </a>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Swords}
              title="摸头 GIF（图片上传版）"
              description="上传头像后本地生成一个轻量简版摸头 GIF，适合做个性签名或评论区头像。"
              className={isToolVisible("pet-gif") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleGeneratePetGif}
                  className="text-sm text-[#6c5b98] dark:text-[#b9aadf]"
                />
                <div className="text-xs leading-6 text-[#7b69a5] dark:text-[#af9fda]">
                  这版是站内自制的极简摸头动效，不依赖外部服务，会生成透明背景
                  GIF。
                </div>
                {petGifError && <OutputBox>{petGifError}</OutputBox>}
                {petGifBusy && (
                  <OutputBox>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      正在生成 GIF，请稍等…
                    </div>
                  </OutputBox>
                )}
                {petGifUrl && !petGifBusy && (
                  <OutputBox className="space-y-3 text-center">
                    <img
                      src={petGifUrl}
                      alt="Patting GIF"
                      className="mx-auto max-h-56 rounded-2xl border border-[#e3d7ff] bg-[radial-gradient(circle_at_center,#f7f2ff,#efe7ff)] p-3"
                    />
                    <a
                      href={petGifUrl}
                      download="pet-pat.gif"
                      className="text-sm text-[#5b3df5] hover:underline"
                    >
                      下载 GIF
                    </a>
                  </OutputBox>
                )}
              </div>
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("network-tools") && (
        <section id="network-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[2].title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[2].description}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              icon={Globe}
              title="客户端 IP"
              description="读取当前请求头里的公网来源信息，适合快速确认反代和访客地址。"
              className={isToolVisible("client-ip") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Button
                  onClick={() => runServerTool("client-ip")}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["client-ip"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "获取客户端信息"
                  )}
                </Button>
                {serverErrors["client-ip"] && (
                  <OutputBox>{serverErrors["client-ip"]}</OutputBox>
                )}
                {serverResults["client-ip"] && (
                  <OutputBox className="space-y-2">
                    <div>IP：{serverResults["client-ip"].ip}</div>
                    <div className="break-all">
                      x-forwarded-for：
                      {serverResults["client-ip"].forwardedFor || "-"}
                    </div>
                    <div className="break-all">
                      User-Agent：{serverResults["client-ip"].userAgent || "-"}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={DatabaseZap}
              title="DNS 查询"
              description="一次拉出 A、AAAA、MX、NS、TXT 等常见记录，方便排查域名解析问题。"
              className={isToolVisible("dns-lookup") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={dnsHost}
                  onChange={(event) => setDnsHost(event.target.value)}
                  placeholder="例如 openai.com"
                />
                <Button
                  onClick={() => runServerTool("dns-lookup", { host: dnsHost })}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["dns-lookup"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "开始查询"
                  )}
                </Button>
                {serverErrors["dns-lookup"] && (
                  <OutputBox>{serverErrors["dns-lookup"]}</OutputBox>
                )}
                {serverResults["dns-lookup"] && (
                  <OutputBox className="space-y-2">
                    <div>
                      A：{serverResults["dns-lookup"].a.join(", ") || "-"}
                    </div>
                    <div>
                      AAAA：{serverResults["dns-lookup"].aaaa.join(", ") || "-"}
                    </div>
                    <div>
                      MX：
                      {serverResults["dns-lookup"].mx
                        .map(
                          (item: { exchange: string; priority: number }) =>
                            `${item.exchange} (${item.priority})`,
                        )
                        .join(", ") || "-"}
                    </div>
                    <div>
                      NS：{serverResults["dns-lookup"].ns.join(", ") || "-"}
                    </div>
                    <div>
                      TXT：{serverResults["dns-lookup"].txt.join(" | ") || "-"}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Wifi}
              title="Ping（TCP 连通性）"
              description="出于运行环境限制，这里做的是 TCP connect 延迟测试，更适合排查端口可达性。"
              className={isToolVisible("ping") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    className={inputClass}
                    value={pingHost}
                    onChange={(event) => setPingHost(event.target.value)}
                    placeholder="目标主机"
                  />
                  <Input
                    className={inputClass}
                    value={pingPort}
                    onChange={(event) => setPingPort(event.target.value)}
                    placeholder="端口，例如 443"
                  />
                </div>
                <Button
                  onClick={() =>
                    runServerTool("ping", {
                      host: pingHost,
                      port: pingPort,
                      count: 4,
                    })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap.ping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "开始 Ping"
                  )}
                </Button>
                {serverErrors.ping && (
                  <OutputBox>{serverErrors.ping}</OutputBox>
                )}
                {serverResults.ping && (
                  <OutputBox className="space-y-2">
                    <div>
                      平均延迟：
                      {serverResults.ping.averageLatency !== null
                        ? `${serverResults.ping.averageLatency} ms`
                        : "全部超时"}
                    </div>
                    <div className="space-y-1">
                      {serverResults.ping.attempts.map(
                        (
                          item: {
                            port: number;
                            open: boolean;
                            latency: number | null;
                            error?: string;
                          },
                          index: number,
                        ) => (
                          <div key={`${item.port}-${index}`}>
                            #{index + 1}：
                            {item.open
                              ? `${item.latency} ms`
                              : `失败 (${item.error || "closed"})`}
                          </div>
                        ),
                      )}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Network}
              title="端口扫描"
              description="支持逗号和短范围写法，如 80,443,3000-3005；为了安全，限制了端口数量和内网目标。"
              className={isToolVisible("port-scan") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={portHost}
                  onChange={(event) => setPortHost(event.target.value)}
                  placeholder="目标主机"
                />
                <Input
                  className={inputClass}
                  value={portExpression}
                  onChange={(event) => setPortExpression(event.target.value)}
                  placeholder="例如 80,443,3000-3005"
                />
                <Button
                  onClick={() =>
                    runServerTool("port-scan", {
                      host: portHost,
                      ports: portExpression,
                    })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["port-scan"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "扫描端口"
                  )}
                </Button>
                {serverErrors["port-scan"] && (
                  <OutputBox>{serverErrors["port-scan"]}</OutputBox>
                )}
                {serverResults["port-scan"] && (
                  <OutputBox className="space-y-2">
                    <div>
                      开放端口：
                      {serverResults["port-scan"].openPorts.join(", ") ||
                        "未发现"}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {serverResults["port-scan"].results.map(
                        (item: {
                          port: number;
                          open: boolean;
                          latency: number | null;
                        }) => (
                          <div
                            key={item.port}
                            className="rounded-xl bg-white/60 px-3 py-2 dark:bg-white/[0.03]"
                          >
                            {item.port} ·{" "}
                            {item.open ? `开放 (${item.latency} ms)` : "关闭"}
                          </div>
                        ),
                      )}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={RefreshCcw}
              title="URL 状态检测"
              description="检测最终跳转地址、状态码和响应头部中的基本信息。"
              className={isToolVisible("url-status") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={urlStatusInput}
                  onChange={(event) => setUrlStatusInput(event.target.value)}
                  placeholder="例如 https://openai.com"
                />
                <Button
                  onClick={() =>
                    runServerTool("url-status", { url: urlStatusInput })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["url-status"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "检测状态"
                  )}
                </Button>
                {serverErrors["url-status"] && (
                  <OutputBox>{serverErrors["url-status"]}</OutputBox>
                )}
                {serverResults["url-status"] && (
                  <OutputBox className="space-y-2">
                    <div>
                      状态：{serverResults["url-status"].status}{" "}
                      {serverResults["url-status"].statusText}
                    </div>
                    <div className="break-all">
                      最终地址：{serverResults["url-status"].finalUrl}
                    </div>
                    <div>
                      类型：{serverResults["url-status"].contentType || "-"}
                    </div>
                    <div>
                      长度：{serverResults["url-status"].contentLength || "-"}
                    </div>
                    <div>
                      Server：{serverResults["url-status"].server || "-"}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={BookOpenText}
              title="网页元数据提取"
              description="提取标题、描述、canonical、favicon 以及常见 OG / Twitter 元信息。"
              className={isToolVisible("web-metadata") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={metadataUrlInput}
                  onChange={(event) => setMetadataUrlInput(event.target.value)}
                  placeholder="输入网页 URL"
                />
                <Button
                  onClick={() =>
                    runServerTool("web-metadata", { url: metadataUrlInput })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["web-metadata"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "提取元数据"
                  )}
                </Button>
                {serverErrors["web-metadata"] && (
                  <OutputBox>{serverErrors["web-metadata"]}</OutputBox>
                )}
                {serverResults["web-metadata"] && (
                  <OutputBox className="space-y-2">
                    <div>标题：{serverResults["web-metadata"].title}</div>
                    <div>
                      描述：{serverResults["web-metadata"].description || "-"}
                    </div>
                    <div className="break-all">
                      Canonical：
                      {serverResults["web-metadata"].canonical || "-"}
                    </div>
                    <div className="break-all">
                      Favicon：{serverResults["web-metadata"].favicon || "-"}
                    </div>
                    <div className="break-all">
                      OG Image：
                      {serverResults["web-metadata"].openGraph?.image || "-"}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="网页图片提取"
              description="列出页面中的常见图片资源，适合快速收集素材或检查首图。"
              className={isToolVisible("web-images") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={imageExtractUrlInput}
                  onChange={(event) =>
                    setImageExtractUrlInput(event.target.value)
                  }
                  placeholder="输入网页 URL"
                />
                <Button
                  onClick={() =>
                    runServerTool("web-images", { url: imageExtractUrlInput })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["web-images"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "提取图片"
                  )}
                </Button>
                {serverErrors["web-images"] && (
                  <OutputBox>{serverErrors["web-images"]}</OutputBox>
                )}
                {serverResults["web-images"] && (
                  <OutputBox className="space-y-3">
                    <div>
                      共提取 {serverResults["web-images"].images.length} 张图片
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {serverResults["web-images"].images
                        .slice(0, 12)
                        .map((item: { url: string; alt: string }) => (
                          <a
                            key={item.url}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-2xl border border-[#e3d7ff] bg-white p-2 dark:border-[#34294f] dark:bg-white/[0.03]"
                          >
                            <img
                              src={item.url}
                              alt={item.alt || "web image"}
                              className="h-28 w-full rounded-xl object-cover"
                            />
                          </a>
                        ))}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={ScrollText}
              title="网页转 Markdown"
              description="抓取页面主体内容并转成 Markdown，适合先做初稿摘录或归档。"
              className={isToolVisible("web-markdown") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={markdownUrlInput}
                  onChange={(event) => setMarkdownUrlInput(event.target.value)}
                  placeholder="输入网页 URL"
                />
                <Button
                  onClick={() =>
                    runServerTool("web-markdown", { url: markdownUrlInput })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["web-markdown"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "转换为 Markdown"
                  )}
                </Button>
                {serverErrors["web-markdown"] && (
                  <OutputBox>{serverErrors["web-markdown"]}</OutputBox>
                )}
                {serverResults["web-markdown"] && (
                  <OutputBox>
                    <textarea
                      className={`${inputClass} min-h-[260px] resize-y font-mono text-xs`}
                      value={serverResults["web-markdown"].markdown}
                      readOnly
                    />
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={FileCode2}
              title="llms.txt 生成器"
              description="一款免费的 llms.txt 生成工具，可以把网站里的核心内容整理成统一的纯文本格式，让 ChatGPT、Claude、Gemini 这类模型更容易读懂、检索和引用你的信息。"
              className={isToolVisible("llms-txt") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={llmsUrlInput}
                  onChange={(event) => setLlmsUrlInput(event.target.value)}
                  placeholder="例如 https://example.com"
                />

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => runServerTool("llms-txt", { url: llmsUrlInput })}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    {loadingMap["llms-txt"] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "生成 llms.txt"
                    )}
                  </Button>

                  {serverResults["llms-txt"]?.generated && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyGeneratedText(
                            "llms-txt",
                            serverResults["llms-txt"].generated,
                          )
                        }
                        className={secondaryButtonClass}
                      >
                        {copiedTool === "llms-txt" ? (
                          <Check className="mr-2 h-4 w-4" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {copiedTool === "llms-txt" ? "已复制" : "复制文本"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadPlainText(
                            "llms.txt",
                            serverResults["llms-txt"].generated,
                          )
                        }
                        className={secondaryButtonClass}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载 llms.txt
                      </Button>
                    </>
                  )}
                </div>

                {serverErrors["llms-txt"] && (
                  <OutputBox>{serverErrors["llms-txt"]}</OutputBox>
                )}

                {serverResults["llms-txt"] && (
                  <OutputBox className="space-y-3">
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <div>站点标题：{serverResults["llms-txt"].siteTitle}</div>
                      <div>主语言：{serverResults["llms-txt"].language || "-"}</div>
                      <div className="break-all">
                        站点地址：{serverResults["llms-txt"].siteUrl}
                      </div>
                      <div>
                        语言版本：
                        {
                          serverResults["llms-txt"].languageVariants.filter(
                            (item: { code: string }) => item.code !== "x-default",
                          ).length
                        }{" "}
                        个
                      </div>
                      <div>
                        主要栏目数：{serverResults["llms-txt"].primarySections.length} 个
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <a
                        href={serverResults["llms-txt"].robots.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1.5 text-[#5c4a88] transition hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#d2c6f3]"
                      >
                        robots.txt
                      </a>
                      <a
                        href={serverResults["llms-txt"].sitemap.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1.5 text-[#5c4a88] transition hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#d2c6f3]"
                      >
                        sitemap.xml
                      </a>
                      {serverResults["llms-txt"].rssUrl && (
                        <a
                          href={serverResults["llms-txt"].rssUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[#ddd0ff] bg-white/70 px-3 py-1.5 text-[#5c4a88] transition hover:border-[#8b6bff] hover:text-[#5b3df5] dark:border-[#392d56] dark:bg-white/[0.03] dark:text-[#d2c6f3]"
                        >
                          RSS / Feed
                        </a>
                      )}
                    </div>

                    {serverResults["llms-txt"].languageVariants.filter(
                      (item: { code: string }) => item.code !== "x-default",
                    ).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#7f71ab] dark:text-[#ab9cd8]">
                          Language Versions
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {serverResults["llms-txt"].languageVariants.map(
                            (item: { code: string; label: string; url: string }) => (
                              item.code === "x-default" ? null : (
                              <a
                                key={`${item.code}-${item.url}`}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-[#dacdff] bg-[#f7f1ff] px-3 py-1.5 text-xs text-[#543c8f] transition hover:border-[#8b6bff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]"
                              >
                                {item.label}
                                <span className="ml-1 text-[#876fc4] dark:text-[#bbaef0]">
                                  {item.code}
                                </span>
                              </a>
                              )
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {serverResults["llms-txt"].primarySections.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-[0.18em] text-[#7f71ab] dark:text-[#ab9cd8]">
                          Primary Sections
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {serverResults["llms-txt"].primarySections.map(
                            (item: { label: string; url: string }) => (
                              <a
                                key={item.url}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full border border-[#dacdff] bg-[#f7f1ff] px-3 py-1.5 text-xs text-[#543c8f] transition hover:border-[#8b6bff] hover:text-[#4f31d7] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]"
                              >
                                {item.label}
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    <textarea
                      className={`${inputClass} min-h-[320px] resize-y font-mono text-xs leading-6`}
                      value={serverResults["llms-txt"].generated}
                      readOnly
                    />
                  </OutputBox>
                )}
              </div>
            </SectionCard>
          </div>
        </section>
      )}

      {isSectionVisible("public-data-tools") && (
        <section id="public-data-tools" className="scroll-mt-28 pt-12 sm:pt-16">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-[#2e2150] dark:text-[#f4efff] sm:text-3xl">
              {sections[3].title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#6c5b98] dark:text-[#b9aadf]">
              {sections[3].description}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              icon={Sparkles}
              title="Minecraft 玩家信息"
              description="查询 UUID、头像和皮肤资源，适合做个人主页挂件或资料卡。"
              className={isToolVisible("minecraft-player") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={minecraftPlayerInput}
                  onChange={(event) =>
                    setMinecraftPlayerInput(event.target.value)
                  }
                  placeholder="例如 Notch"
                />
                <Button
                  onClick={() =>
                    runServerTool("minecraft-player", {
                      username: minecraftPlayerInput,
                    })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["minecraft-player"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "查询玩家"
                  )}
                </Button>
                {serverErrors["minecraft-player"] && (
                  <OutputBox>{serverErrors["minecraft-player"]}</OutputBox>
                )}
                {serverResults["minecraft-player"] && (
                  <OutputBox className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={serverResults["minecraft-player"].avatarUrl}
                        alt="Minecraft avatar"
                        className="h-14 w-14 rounded-2xl border border-[#e3d7ff]"
                      />
                      <div>
                        <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">
                          {serverResults["minecraft-player"].username}
                        </div>
                        <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                          {serverResults["minecraft-player"].id}
                        </div>
                      </div>
                    </div>
                    <div className="break-all text-xs">
                      皮肤：{serverResults["minecraft-player"].skinUrl}
                    </div>
                    {serverResults["minecraft-player"].capeUrl && (
                      <div className="break-all text-xs">
                        披风：{serverResults["minecraft-player"].capeUrl}
                      </div>
                    )}
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Wifi}
              title="Minecraft 服务器信息"
              description="基于 mcstatus.io 免费接口查询 Java 或 Bedrock 服务器状态。"
              className={isToolVisible("minecraft-server") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setMinecraftEdition("java")}
                    className={`rounded-full px-4 py-2 text-sm transition ${minecraftEdition === "java" ? "bg-[#5b3df5] text-white" : "bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]"}`}
                  >
                    Java
                  </button>
                  <button
                    onClick={() => setMinecraftEdition("bedrock")}
                    className={`rounded-full px-4 py-2 text-sm transition ${minecraftEdition === "bedrock" ? "bg-[#5b3df5] text-white" : "bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]"}`}
                  >
                    Bedrock
                  </button>
                </div>
                <Input
                  className={inputClass}
                  value={minecraftServerInput}
                  onChange={(event) =>
                    setMinecraftServerInput(event.target.value)
                  }
                  placeholder="例如 mc.hypixel.net"
                />
                <Button
                  onClick={() =>
                    runServerTool("minecraft-server", {
                      address: minecraftServerInput,
                      edition: minecraftEdition,
                    })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["minecraft-server"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "查询服务器"
                  )}
                </Button>
                {serverErrors["minecraft-server"] && (
                  <OutputBox>{serverErrors["minecraft-server"]}</OutputBox>
                )}
                {serverResults["minecraft-server"] && (
                  <OutputBox className="space-y-2">
                    <div>
                      在线状态：
                      {serverResults["minecraft-server"].data.online
                        ? "在线"
                        : "离线"}
                    </div>
                    <div>
                      版本：
                      {serverResults["minecraft-server"].data.version
                        ?.name_clean ||
                        serverResults["minecraft-server"].data.version?.name ||
                        "-"}
                    </div>
                    <div>
                      玩家：
                      {serverResults["minecraft-server"].data.players?.online ??
                        "-"}{" "}
                      /{" "}
                      {serverResults["minecraft-server"].data.players?.max ??
                        "-"}
                    </div>
                    <div className="break-all">
                      MOTD：
                      {serverResults["minecraft-server"].data.motd?.clean ||
                        serverResults["minecraft-server"].data.motd?.raw ||
                        "-"}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Globe}
              title="GitHub 仓库信息"
              description="解析 owner/repo 或完整仓库地址，返回 stars、forks、topics 和语言分布。"
              className={isToolVisible("github-repo") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={githubRepoInput}
                  onChange={(event) => setGithubRepoInput(event.target.value)}
                  placeholder="例如 vercel/next.js"
                />
                <Button
                  onClick={() =>
                    runServerTool("github-repo", { repo: githubRepoInput })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["github-repo"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "查询仓库"
                  )}
                </Button>
                {serverErrors["github-repo"] && (
                  <OutputBox>{serverErrors["github-repo"]}</OutputBox>
                )}
                {serverResults["github-repo"] && (
                  <OutputBox className="space-y-2">
                    <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">
                      {serverResults["github-repo"].fullName}
                    </div>
                    <div>{serverResults["github-repo"].description || "-"}</div>
                    <div>
                      Stars {serverResults["github-repo"].stars} · Forks{" "}
                      {serverResults["github-repo"].forks} · Issues{" "}
                      {serverResults["github-repo"].openIssues}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(serverResults["github-repo"].topics || [])
                        .slice(0, 8)
                        .map((topic: string) => (
                          <span
                            key={topic}
                            className="rounded-full bg-[#f1eaff] px-3 py-1 text-xs text-[#5b3df5] dark:bg-[#241739] dark:text-[#d9ccff]"
                          >
                            {topic}
                          </span>
                        ))}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={Hash}
              title="Gravatar"
              description="输入邮箱即可本地算出 MD5，并拼出 Gravatar 头像与资料页地址。"
              className={isToolVisible("gravatar") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={gravatarEmail}
                  onChange={(event) => setGravatarEmail(event.target.value)}
                  placeholder="邮箱地址"
                />
                <Button
                  onClick={() =>
                    runServerTool("gravatar", {
                      email: gravatarEmail,
                      size: 256,
                    })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap.gravatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "生成头像地址"
                  )}
                </Button>
                {serverErrors.gravatar && (
                  <OutputBox>{serverErrors.gravatar}</OutputBox>
                )}
                {serverResults.gravatar && (
                  <OutputBox className="space-y-3">
                    <img
                      src={serverResults.gravatar.avatarUrl}
                      alt="Gravatar avatar"
                      className="h-24 w-24 rounded-full border border-[#e3d7ff]"
                    />
                    <div className="break-all font-mono text-xs">
                      {serverResults.gravatar.hash}
                    </div>
                    <a
                      href={serverResults.gravatar.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#5b3df5] hover:underline"
                    >
                      打开 Gravatar 资料页{" "}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={MapPinned}
              title="基础 IP 归属"
              description="优先查输入的 IP，没有的话就查你当前请求来源，基于本地 GeoIP 库完成。"
              className={isToolVisible("ip-geo") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={geoIpInput}
                  onChange={(event) => setGeoIpInput(event.target.value)}
                  placeholder="可留空，默认查询当前访问 IP"
                />
                <Button
                  onClick={() => runServerTool("ip-geo", { ip: geoIpInput })}
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["ip-geo"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "查询归属"
                  )}
                </Button>
                {serverErrors["ip-geo"] && (
                  <OutputBox>{serverErrors["ip-geo"]}</OutputBox>
                )}
                {serverResults["ip-geo"] && (
                  <OutputBox className="space-y-2">
                    <div>IP：{serverResults["ip-geo"].ip}</div>
                    <div>
                      国家 / 地区：{serverResults["ip-geo"].country || "-"} /{" "}
                      {serverResults["ip-geo"].region || "-"}
                    </div>
                    <div>城市：{serverResults["ip-geo"].city || "-"}</div>
                    <div>时区：{serverResults["ip-geo"].timezone || "-"}</div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={MapPinned}
              title="手机号归属地"
              description="使用本地号段库查询中国大陆手机号的省市和运营商，不走在线接口。"
              className={isToolVisible("mobile-area") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <Input
                  className={inputClass}
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="例如 13800138000"
                />
                <Button
                  onClick={() =>
                    runServerTool("mobile-area", { phone: phoneInput })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["mobile-area"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "查询归属地"
                  )}
                </Button>
                {serverErrors["mobile-area"] && (
                  <OutputBox>{serverErrors["mobile-area"]}</OutputBox>
                )}
                {serverResults["mobile-area"] && (
                  <OutputBox className="space-y-2">
                    <div>号码：{serverResults["mobile-area"].phone}</div>
                    <div>
                      省份：{serverResults["mobile-area"].province || "-"}
                    </div>
                    <div>城市：{serverResults["mobile-area"].city || "-"}</div>
                    <div>
                      运营商：{serverResults["mobile-area"].carrier || "-"}
                    </div>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={ImageIcon}
              title="Bing 每日壁纸"
              description="直接拉取 Bing 当天壁纸，适合拿来做背景图、封面图或桌面收藏。"
              className={isToolVisible("bing-wallpaper") ? "" : "hidden"}
            >
              <div className="space-y-3">
                <FancySelect
                  value={bingMarket}
                  onChange={setBingMarket}
                  ariaLabel="选择 Bing 区域"
                  options={[
                    { value: "zh-CN", label: "中国大陆（zh-CN）" },
                    { value: "en-US", label: "美国（en-US）" },
                    { value: "ja-JP", label: "日本（ja-JP）" },
                  ]}
                />
                <Button
                  onClick={() =>
                    runServerTool("bing-wallpaper", { market: bingMarket })
                  }
                  className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                >
                  {loadingMap["bing-wallpaper"] ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "获取壁纸"
                  )}
                </Button>
                {serverErrors["bing-wallpaper"] && (
                  <OutputBox>{serverErrors["bing-wallpaper"]}</OutputBox>
                )}
                {serverResults["bing-wallpaper"] && (
                  <OutputBox className="space-y-3">
                    <img
                      src={serverResults["bing-wallpaper"].url}
                      alt={serverResults["bing-wallpaper"].title}
                      className="max-h-64 rounded-2xl border border-[#e3d7ff] object-cover"
                    />
                    <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">
                      {serverResults["bing-wallpaper"].title}
                    </div>
                    <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                      {serverResults["bing-wallpaper"].copyright}
                    </div>
                    <a
                      href={serverResults["bing-wallpaper"].url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-[#5b3df5] hover:underline"
                    >
                      打开原图
                    </a>
                  </OutputBox>
                )}
              </div>
            </SectionCard>

            <SectionCard
              icon={BookOpenText}
              title="答案之书 / 诗词 / 历史今天"
              description="把轻量的内容型接口也收进来，适合做主页小挂件或随机内容卡片。"
              className={isToolVisible("content-tools") ? "" : "hidden"}
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#e3d7ff] bg-white/60 p-4 dark:border-[#34294f] dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-[#2f2154] dark:text-[#f4efff]">
                    答案之书
                  </div>
                  <Input
                    className={inputClass}
                    value={answerQuestion}
                    onChange={(event) => setAnswerQuestion(event.target.value)}
                    placeholder="输入问题"
                  />
                  <Button
                    onClick={() =>
                      runServerTool("answer-book", { question: answerQuestion })
                    }
                    className="mt-3 rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    {loadingMap["answer-book"] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "翻一页"
                    )}
                  </Button>
                  {serverResults["answer-book"] && (
                    <div className="mt-3 text-sm leading-7 text-[#5b3df5] dark:text-[#d9ccff]">
                      {serverResults["answer-book"].answer}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#e3d7ff] bg-white/60 p-4 dark:border-[#34294f] dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-[#2f2154] dark:text-[#f4efff]">
                    随机诗词
                  </div>
                  <Button
                    onClick={() => runServerTool("poetry")}
                    className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                  >
                    {loadingMap.poetry ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "来一首"
                    )}
                  </Button>
                  {serverResults.poetry && (
                    <div className="mt-3 space-y-2 text-sm leading-7 text-[#5c4a88] dark:text-[#d9ccff]">
                      <div className="font-medium text-[#2f2154] dark:text-[#f4efff]">
                        {serverResults.poetry.title}
                      </div>
                      <div>{serverResults.poetry.content}</div>
                      <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                        {serverResults.poetry.dynasty} ·{" "}
                        {serverResults.poetry.author}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-[#e3d7ff] bg-white/60 p-4 dark:border-[#34294f] dark:bg-white/[0.03]">
                  <div className="mb-2 text-sm font-medium text-[#2f2154] dark:text-[#f4efff]">
                    历史今天
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      className={inputClass}
                      value={historyMonth}
                      onChange={(event) => setHistoryMonth(event.target.value)}
                      placeholder="月"
                    />
                    <Input
                      className={inputClass}
                      value={historyDay}
                      onChange={(event) => setHistoryDay(event.target.value)}
                      placeholder="日"
                    />
                    <Button
                      onClick={() =>
                        runServerTool("history-today", {
                          month: historyMonth,
                          day: historyDay,
                        })
                      }
                      className="rounded-full bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
                    >
                      {loadingMap["history-today"] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "查询"
                      )}
                    </Button>
                  </div>
                  {serverResults["history-today"] && (
                    <div className="mt-3 space-y-2 text-sm leading-6 text-[#5c4a88] dark:text-[#d9ccff]">
                      {serverResults["history-today"].events
                        .slice(0, 6)
                        .map(
                          (
                            item: { year: string; text: string },
                            index: number,
                          ) => (
                            <div
                              key={`${item.year}-${index}`}
                              className="rounded-xl border border-[#ece3ff] px-3 py-2 dark:border-[#322746]"
                            >
                              <span className="mr-2 font-semibold text-[#2f2154] dark:text-[#f4efff]">
                                {item.year}
                              </span>
                              {item.text}
                            </div>
                          ),
                        )}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      )}

      <div className="mt-14 rounded-[28px] border border-[#e6dbff] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(246,240,255,0.92))] px-6 py-6 text-sm leading-7 text-[#66568f] shadow-[0_18px_60px_rgba(91,61,245,0.06)] dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))] dark:text-[#c4b6eb]">
        <p>
          网络类工具默认会拦截
          <code className="mx-1 rounded bg-[#efe8ff] px-1.5 py-0.5 text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]">
            localhost
          </code>
          和常见内网地址，避免把这个页面变成 SSRF
          或内网探测入口。后续如果你想把每个工具拆成独立详情页，也可以直接在这个基础上继续分。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/resources" className="text-[#5b3df5] hover:underline">
            去看资源页
          </Link>
          <Link href="/about" className="text-[#5b3df5] hover:underline">
            查看关于页
          </Link>
        </div>
      </div>
    </div>
  );
}
