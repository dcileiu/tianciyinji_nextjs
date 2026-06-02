import { SENSITIVE_WORDS } from "@/lib/tools/content";

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

export function base64ToBytes(value: string) {
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

export async function encryptAesGcm(text: string, password: string) {
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

export async function decryptAesGcm(payload: string, password: string) {
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

export function encodeTextToBase64(text: string) {
  return bytesToBase64(new TextEncoder().encode(text));
}

export function decodeBase64ToText(value: string) {
  return new TextDecoder().decode(base64ToBytes(value));
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function dataUrlByteSize(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] || "";
  const padding = base64.match(/=+$/)?.[0].length || 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function parseTimestampInput(input: string) {
  const raw = input.trim();
  if (!raw) return new Date();
  if (/^\d{10}$/.test(raw)) return new Date(Number(raw) * 1000);
  if (/^\d{13}$/.test(raw)) return new Date(Number(raw));
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime()))
    throw new Error("无法识别这个时间戳或日期。");
  return parsed;
}

export function analyzeParameters(input: string) {
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

export function detectSensitiveWords(input: string) {
  const text = input.trim();
  if (!text) return [];
  return SENSITIVE_WORDS.map((word) => {
    const count = text.split(word).length - 1;
    return count > 0 ? { word, count } : null;
  }).filter(Boolean) as Array<{ word: string; count: number }>;
}

export function generateRandomString(length: number, alphabet: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("读取文件失败。"));
    reader.readAsDataURL(file);
  });
}

export function loadImageElement(src: string) {
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

export async function generatePetGifFromDataUrl(dataUrl: string) {
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
