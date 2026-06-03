'use client';

import { Check, Copy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/tools/TranslationContext';

const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]';

const outBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 p-3 dark:border-[#2c2347] dark:bg-white/[0.03]';

function CopyCss({ css }: { css: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <div className={`${outBox} flex items-start justify-between gap-2`}>
      <code className="break-all font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">{css}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(css);
            setCopied(true);
            toast.success(t('已复制'));
            setTimeout(() => setCopied(false), 1500);
          } catch {
            toast.error(t('复制失败'));
          }
        }}
        className="shrink-0 text-[#9686c0] transition hover:text-[#5b3df5]"
        aria-label={t('复制 CSS')}
      >
        {copied ? <Check className="h-4 w-4 text-[#5b3df5]" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Slider({ label, value, onChange, min, max, step = 1, unit = 'px' }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; unit?: string }) {
  const { t } = useTranslation();
  return (
    <label className="flex items-center gap-2 text-sm text-[#5c4a88] dark:text-[#d2c6f3]">
      <span className="w-20 shrink-0">{t(label)}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-[#5b3df5]" />
      <span className="w-14 shrink-0 text-right font-mono text-xs">
        {value}
        {unit}
      </span>
    </label>
  );
}

/* ===================== CSS 渐变生成 ===================== */
export function CssGradientTool() {
  const { t } = useTranslation();
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(135);
  const [c1, setC1] = useState('#5b3df5');
  const [c2, setC2] = useState('#b79bff');
  const css = type === 'linear' ? `linear-gradient(${angle}deg, ${c1}, ${c2})` : `radial-gradient(circle, ${c1}, ${c2})`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['linear', 'radial'] as const).map((tBtn) => (
          <button
            key={tBtn}
            type="button"
            onClick={() => setType(tBtn)}
            className={cn('rounded-full px-4 py-2 text-sm transition', type === tBtn ? 'bg-[#5b3df5] text-white' : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]')}
          >
            {tBtn === 'linear' ? t('线性') : t('径向')}
          </button>
        ))}
        <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" />
        <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" />
      </div>
      {type === 'linear' && <Slider label="角度" value={angle} onChange={setAngle} min={0} max={360} unit="°" />}
      <div className="h-24 w-full rounded-2xl border border-[#ece3ff] dark:border-[#2c2347]" style={{ background: css }} />
      <CopyCss css={`background: ${css};`} />
    </div>
  );
}

/* ===================== box-shadow 生成 ===================== */
export function BoxShadowTool() {
  const { t } = useTranslation();
  const [x, setX] = useState(0);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(30);
  const [spread, setSpread] = useState(-6);
  const [color, setColor] = useState('#5b3df5');
  const [opacity, setOpacity] = useState(0.25);
  const [inset, setInset] = useState(false);

  const rgba = useMemo(() => {
    const m = color.replace('#', '');
    const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
  }, [color, opacity]);

  const css = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${rgba}`;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Slider label="水平 X" value={x} onChange={setX} min={-50} max={50} />
        <Slider label="垂直 Y" value={y} onChange={setY} min={-50} max={50} />
        <Slider label="模糊" value={blur} onChange={setBlur} min={0} max={100} />
        <Slider label="扩散" value={spread} onChange={setSpread} min={-50} max={50} />
        <Slider label="透明度" value={opacity} onChange={setOpacity} min={0} max={1} step={0.05} unit="" />
        <label className="flex items-center gap-2 text-sm text-[#5c4a88] dark:text-[#d2c6f3]">
          <span className="w-20 shrink-0">{t('颜色')}</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-[#dfd3ff] dark:border-[#33274f]" />
          <label className="ml-2 flex items-center gap-1.5">
            <input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="accent-[#5b3df5]" />
            {t('内阴影')}
          </label>
        </label>
      </div>
      <div className="flex items-center justify-center rounded-2xl border border-[#ece3ff] bg-[#faf7ff] py-10 dark:border-[#2c2347] dark:bg-[#181127]">
        <div className="h-24 w-24 rounded-2xl bg-white dark:bg-[#241a3d]" style={{ boxShadow: css }} />
      </div>
      <CopyCss css={`box-shadow: ${css};`} />
    </div>
  );
}

/* ===================== border-radius 生成 ===================== */
export function BorderRadiusTool() {
  const [tl, setTl] = useState(16);
  const [tr, setTr] = useState(16);
  const [br, setBr] = useState(16);
  const [bl, setBl] = useState(16);
  const css = `${tl}px ${tr}px ${br}px ${bl}px`;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Slider label="左上" value={tl} onChange={setTl} min={0} max={150} />
        <Slider label="右上" value={tr} onChange={setTr} min={0} max={150} />
        <Slider label="右下" value={br} onChange={setBr} min={0} max={150} />
        <Slider label="左下" value={bl} onChange={setBl} min={0} max={150} />
      </div>
      <div className="flex items-center justify-center rounded-2xl border border-[#ece3ff] bg-[#faf7ff] py-10 dark:border-[#2c2347] dark:bg-[#181127]">
        <div className="h-28 w-40 border-2 border-[#5b3df5] bg-[#ece3ff] dark:bg-[#2b1f43]" style={{ borderRadius: css }} />
      </div>
      <CopyCss css={`border-radius: ${css};`} />
    </div>
  );
}

/* ===================== 调色板生成 ===================== */
function hexToHsl(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const n = parseInt(full, 16);
  let r = ((n >> 16) & 255) / 255;
  let g = ((n >> 8) & 255) / 255;
  let b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}
function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function PaletteSwatch({ hex }: { hex: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(hex);
          setCopied(true);
          toast.success(t('已复制') + ' ' + hex);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          toast.error(t('复制失败'));
        }
      }}
      className="group flex flex-col items-center gap-1"
    >
      <span className="h-12 w-full rounded-lg border border-black/5" style={{ backgroundColor: hex }} />
      <span className="flex items-center gap-1 font-mono text-[11px] text-[#3a2c63] dark:text-[#e6def9]">
        {hex}
        {copied ? <Check className="h-3 w-3 text-[#5b3df5]" /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-60" />}
      </span>
    </button>
  );
}

export function PaletteTool() {
  const [base, setBase] = useState('#5b3df5');
  const palette = useMemo(() => {
    try {
      const [h, s] = hexToHsl(base);
      const lights = [95, 85, 72, 60, 50, 42, 34, 26, 18];
      return lights.map((l) => hslToHex(h, s, l));
    } catch {
      return [];
    }
  }, [base]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input type="color" value={base} onChange={(e) => setBase(e.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" />
        <Input className={inputClass} value={base} onChange={(e) => setBase(e.target.value)} placeholder="#5b3df5" />
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {palette.map((c, i) => (
          <PaletteSwatch key={`${c}-${i}`} hex={c} />
        ))}
      </div>
    </div>
  );
}
