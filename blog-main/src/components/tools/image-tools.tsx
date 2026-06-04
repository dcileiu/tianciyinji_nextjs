'use client';

import { Check, Copy, Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/tools/TranslationContext';

const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]';

const outBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 p-3 text-sm dark:border-[#2c2347] dark:bg-white/[0.03]';

function loadImage(file: File, t: (s: string) => string): Promise<{ img: HTMLImageElement; dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => resolve({ img, dataUrl, size: file.size });
      img.onerror = () => reject(new Error(t('imageLoadFailed')));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error(t('fileReadFailed')));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function dataUrlSize(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] || '';
  const padding = base64.match(/=+$/)?.[0].length || 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function FileDrop({ onFile, hint, fileName }: { onFile: (file: File) => void; hint?: string; fileName?: string }) {
  const { t } = useTranslation();
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#cdbcff] bg-white/60 px-4 py-6 text-center transition hover:border-[#8b6bff] hover:bg-[#f5f0ff] dark:border-[#3a2f58] dark:bg-white/[0.03]"
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ece3ff] text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#cbbcff]">
        <Upload className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">{fileName || t('clickOrDragAnImageHere')}</span>
      <span className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{hint || t('processingRunsLocallyInYourBrowser')}</span>
    </label>
  );
}

/* ===================== 图片格式转换 ===================== */
const FORMATS = [
  { mime: 'image/png', label: 'PNG', ext: 'png' },
  { mime: 'image/jpeg', label: 'JPG', ext: 'jpg' },
  { mime: 'image/webp', label: 'WebP', ext: 'webp' },
] as const;

export function ImageConvertTool() {
  const { t } = useTranslation();
  const [state, setState] = useState<{ img: HTMLImageElement; size: number } | null>(null);
  const [fileName, setFileName] = useState('');
  const [format, setFormat] = useState<(typeof FORMATS)[number]['mime']>('image/webp');
  const [quality, setQuality] = useState('0.9');
  const [out, setOut] = useState<{ url: string; size: number } | null>(null);

  async function onFile(file: File) {
    setFileName(file.name);
    setOut(null);
    const { img, size } = await loadImage(file, t);
    setState({ img, size });
  }

  function convert() {
    if (!state) return;
    const canvas = document.createElement('canvas');
    canvas.width = state.img.naturalWidth;
    canvas.height = state.img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(state.img, 0, 0);
    const url = canvas.toDataURL(format, Number(quality));
    setOut({ url, size: dataUrlSize(url) });
  }

  const ext = FORMATS.find((f) => f.mime === format)?.ext || 'png';

  return (
    <div className="space-y-3">
      <FileDrop onFile={onFile} fileName={fileName} hint={t('imageFormatConvertHint')} />
      {state && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.mime}
                type="button"
                onClick={() => setFormat(f.mime)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm transition',
                  format === f.mime
                    ? 'bg-[#5b3df5] text-white'
                    : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
                )}
              >
                {f.label}
              </button>
            ))}
            {format !== 'image/png' && (
              <label className="flex items-center gap-2 text-sm text-[#5c4a88] dark:text-[#d2c6f3]">
                {t('quality')}
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="accent-[#5b3df5]"
                />
                {quality}
              </label>
            )}
            <Button onClick={convert} className="bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
              {t('convert')}
            </Button>
          </div>
          <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
            {t('originalSize')}: {formatBytes(state.size)}
          </div>
          {out && (
            <div className={`${outBox} flex flex-wrap items-center gap-3`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={out.url} alt={t('conversionResult')} className="h-20 w-20 rounded-lg object-contain" />
              <div className="text-sm text-[#3a2c63] dark:text-[#e6def9]">
                {t('outputSize')}: {formatBytes(out.size)}
              </div>
              <a
                href={out.url}
                download={`converted.${ext}`}
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#5b3df5] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#4f31d7]"
              >
                <Download className="h-3.5 w-3.5" />
                {t('download')} {ext.toUpperCase()}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===================== 图片裁剪 / 改尺寸 ===================== */
export function ImageResizeTool() {
  const { t } = useTranslation();
  const [state, setState] = useState<{ img: HTMLImageElement } | null>(null);
  const [fileName, setFileName] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lock, setLock] = useState(true);
  const [ratio, setRatio] = useState(1);
  const [out, setOut] = useState('');

  async function onFile(file: File) {
    setFileName(file.name);
    setOut('');
    const { img } = await loadImage(file, t);
    setState({ img });
    setWidth(String(img.naturalWidth));
    setHeight(String(img.naturalHeight));
    setRatio(img.naturalWidth / img.naturalHeight);
  }

  function onWidth(v: string) {
    setWidth(v);
    if (lock && v) setHeight(String(Math.round(Number(v) / ratio)));
  }
  function onHeight(v: string) {
    setHeight(v);
    if (lock && v) setWidth(String(Math.round(Number(v) * ratio)));
  }

  function resize() {
    if (!state) return;
    const w = Math.max(1, Math.round(Number(width)));
    const h = Math.max(1, Math.round(Number(height)));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(state.img, 0, 0, w, h);
    setOut(canvas.toDataURL('image/png'));
  }

  return (
    <div className="space-y-3">
      <FileDrop onFile={onFile} fileName={fileName} hint={t('resizeExportPngHint')} />
      {state && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Input className={`${inputClass} max-w-[120px]`} value={width} onChange={(e) => onWidth(e.target.value)} placeholder={t('width')} inputMode="numeric" />
            <span className="text-[#7b69a5] dark:text-[#af9fda]">×</span>
            <Input className={`${inputClass} max-w-[120px]`} value={height} onChange={(e) => onHeight(e.target.value)} placeholder={t('height')} inputMode="numeric" />
            <label className="flex items-center gap-1.5 text-sm text-[#5c4a88] dark:text-[#d2c6f3]">
              <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} className="accent-[#5b3df5]" />
              {t('lockAspectRatio')}
            </label>
            <Button onClick={resize} className="bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
              {t('generate')}
            </Button>
          </div>
          {out && (
            <div className={`${outBox} flex flex-wrap items-center gap-3`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={out} alt={t('resizeResult')} className="h-20 max-w-[120px] rounded-lg object-contain" />
              <a
                href={out}
                download={`resized-${width}x${height}.png`}
                className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#5b3df5] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#4f31d7]"
              >
                <Download className="h-3.5 w-3.5" />
                {t('downloadPng')}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===================== 图片加水印 ===================== */
const POSITIONS = [
  { id: 'tl', label: 'topLeft' },
  { id: 'tc', label: 'topCenter' },
  { id: 'tr', label: 'topRight' },
  { id: 'ml', label: 'middleLeft' },
  { id: 'mc', label: 'center' },
  { id: 'mr', label: 'middleRight' },
  { id: 'bl', label: 'bottomLeft' },
  { id: 'bc', label: 'bottomCenter' },
  { id: 'br', label: 'bottomRight' },
] as const;

export function ImageWatermarkTool() {
  const { t } = useTranslation();
  const [state, setState] = useState<{ img: HTMLImageElement } | null>(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('itianci.cn');
  const [size, setSize] = useState('32');
  const [opacity, setOpacity] = useState('0.5');
  const [color, setColor] = useState('#ffffff');
  const [pos, setPos] = useState<(typeof POSITIONS)[number]['id']>('br');
  const [tile, setTile] = useState(false);
  const [out, setOut] = useState('');

  async function onFile(file: File) {
    setFileName(file.name);
    setOut('');
    const { img } = await loadImage(file, t);
    setState({ img });
  }

  function apply() {
    if (!state) return;
    const { img } = state;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const fontSize = Number(size);
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = Number(opacity);
    ctx.textBaseline = 'middle';

    if (tile) {
      ctx.save();
      ctx.rotate(-Math.PI / 8);
      const stepX = ctx.measureText(text).width + fontSize * 3;
      const stepY = fontSize * 4;
      for (let y = -canvas.height; y < canvas.height * 1.5; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 1.5; x += stepX) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    } else {
      const m = fontSize;
      const tw = ctx.measureText(text).width;
      const xMap: Record<string, number> = {
        l: m,
        c: (canvas.width - tw) / 2,
        r: canvas.width - tw - m,
      };
      const yMap: Record<string, number> = {
        t: m,
        m: canvas.height / 2,
        b: canvas.height - m,
      };
      ctx.textAlign = 'left';
      ctx.fillText(text, xMap[pos[1]], yMap[pos[0]]);
    }
    ctx.globalAlpha = 1;
    setOut(canvas.toDataURL('image/png'));
  }

  return (
    <div className="space-y-3">
      <FileDrop onFile={onFile} fileName={fileName} hint={t('addTextWatermarkTileHint')} />
      {state && (
        <>
          <Input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('watermarkText')} />
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#5c4a88] dark:text-[#d2c6f3]">
            <label className="flex items-center gap-1.5">
              {t('fontSize')}
              <Input className={`${inputClass} max-w-[80px]`} value={size} onChange={(e) => setSize(e.target.value)} inputMode="numeric" />
            </label>
            <label className="flex items-center gap-1.5">
              {t('opacity')}
              <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(e.target.value)} className="accent-[#5b3df5]" />
            </label>
            <label className="flex items-center gap-1.5">
              {t('color')}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-9 cursor-pointer rounded border border-[#dfd3ff] dark:border-[#33274f]" />
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={tile} onChange={(e) => setTile(e.target.checked)} className="accent-[#5b3df5]" />
              {t('tile')}
            </label>
          </div>
          {!tile && (
            <div className="grid w-fit grid-cols-3 gap-1">
              {POSITIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPos(p.id)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs transition',
                    pos === p.id
                      ? 'bg-[#5b3df5] text-white'
                      : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
                  )}
                >
                  {t(p.label)}
                </button>
              ))}
            </div>
          )}
          <Button onClick={apply} className="bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
            {t('generateWatermarkedImage')}
          </Button>
          {out && (
            <div className={`${outBox} space-y-2`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={out} alt={t('watermarkResult')} className="max-h-64 w-auto rounded-lg" />
              <a
                href={out}
                download="watermark.png"
                className="inline-flex items-center gap-1 rounded-full bg-[#5b3df5] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#4f31d7]"
              >
                <Download className="h-3.5 w-3.5" />
                {t('downloadPng')}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===================== 图片主色调提取 ===================== */
function ColorSwatch({ hex }: { hex: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hex);
          setCopied(true);
          toast.success(t('copied') + ' ' + hex);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error(t('copyFailed'));
        }
      }}
      className="flex items-center gap-2 rounded-2xl border border-[#ece3ff] bg-white/60 p-2 text-left transition hover:border-[#8b6bff] dark:border-[#2c2347] dark:bg-white/[0.03]"
    >
      <span className="h-10 w-10 rounded-lg border border-black/5" style={{ backgroundColor: hex }} />
      <span className="font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">{hex}</span>
      {copied ? <Check className="h-3.5 w-3.5 text-[#5b3df5]" /> : <Copy className="h-3.5 w-3.5 text-[#9686c0]" />}
    </button>
  );
}

export function ColorExtractTool() {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState('');
  const [colors, setColors] = useState<string[]>([]);

  async function onFile(file: File) {
    setFileName(file.name);
    const { img, dataUrl } = await loadImage(file, t);
    setPreview(dataUrl);
    const w = 80;
    const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 125) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
      const bucket = buckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
      bucket.count += 1;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      buckets.set(key, bucket);
    }
    const top = Array.from(buckets.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((bk) => {
        const r = Math.round(bk.r / bk.count);
        const g = Math.round(bk.g / bk.count);
        const b = Math.round(bk.b / bk.count);
        return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
      });
    setColors(top);
  }

  return (
    <div className="space-y-3">
      <FileDrop onFile={onFile} fileName={fileName} hint={t('extractDominantColorsHint')} />
      {preview && (
        <div className="flex flex-wrap items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={t('preview')} className="h-24 w-24 rounded-lg object-cover" />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3">
            {colors.map((c) => (
              <ColorSwatch key={c} hex={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
