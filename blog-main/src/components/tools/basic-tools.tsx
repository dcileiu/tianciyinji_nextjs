'use client';

import { Check, Copy, Download, Upload } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]';

const statBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 px-3 py-3 text-center dark:border-[#2c2347] dark:bg-white/[0.03]';

const outBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 p-3 text-sm dark:border-[#2c2347] dark:bg-white/[0.03]';

function CopyButton({ text, label = '复制' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success('已复制');
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error('复制失败');
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}

/* ============================ 字数统计 ============================ */
export function WordCountTool() {
  const [text, setText] = useState('');
  const stats = useMemo(() => {
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const numbers = (text.match(/\d/g) || []).length;
    const noSpaceLen = text.replace(/\s/g, '').length;
    const punctuation = Math.max(0, noSpaceLen - chinese - letters - numbers);
    const lines = text ? text.split(/\r?\n/).length : 0;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
    return {
      withSpaces: text.length,
      noSpaces: text.replace(/\s/g, '').length,
      chinese,
      englishWords,
      numbers,
      punctuation,
      lines,
      paragraphs,
    };
  }, [text]);

  const items = [
    { label: '总字符数', value: stats.withSpaces },
    { label: '字符数(不含空格)', value: stats.noSpaces },
    { label: '中文字数', value: stats.chinese },
    { label: '英文单词', value: stats.englishWords },
    { label: '数字', value: stats.numbers },
    { label: '标点/符号', value: stats.punctuation },
    { label: '行数', value: stats.lines },
    { label: '段落', value: stats.paragraphs },
  ];

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[150px] resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="在这里输入或粘贴文本，实时统计字数"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={statBox}>
            <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{item.label}</div>
            <div className="mt-1 text-lg font-semibold text-[#3a2c63] dark:text-[#f1ebff]">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================= 人民币金额大写 ========================= */
function digitUppercase(money: number): string {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  const head = money < 0 ? '欠' : '';
  let n = Math.abs(money);
  let s = '';
  for (let i = 0; i < fraction.length; i++) {
    s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
  }
  s = s || '整';
  n = Math.floor(n);
  for (let i = 0; i < unit[0].length && n > 0; i++) {
    let p = '';
    for (let j = 0; j < unit[1].length && n > 0; j++) {
      p = digit[n % 10] + unit[1][j] + p;
      n = Math.floor(n / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }
  return (
    head +
    s
      .replace(/(零.)*零元/, '元')
      .replace(/(零.)+/g, '零')
      .replace(/^整$/, '零元整')
  );
}

export function RmbCapitalTool() {
  const [value, setValue] = useState('');
  const result = useMemo(() => {
    if (value.trim() === '') return '';
    const num = Number(value.replace(/,/g, ''));
    if (!Number.isFinite(num)) return '输入有误，请填写数字。';
    if (Math.abs(num) >= 1e12) return '金额过大，请控制在万亿以内。';
    return digitUppercase(num);
  }, [value]);

  return (
    <div className="space-y-3">
      <Input
        className={inputClass}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入金额，例如 10086.55"
        inputMode="decimal"
      />
      {result && (
        <div className={outBox}>
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-semibold text-[#3a2c63] dark:text-[#f1ebff]">{result}</div>
            <CopyButton text={result} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ 正则测试器 ============================ */
export function RegexTesterTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [testText, setTestText] = useState('联系：hello@itianci.cn 或 admin@example.com');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false });

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [] as RegExpMatchArray[], error: '' };
    const flagStr = Object.entries(flags)
      .filter(([, on]) => on)
      .map(([f]) => f)
      .join('');
    try {
      const re = new RegExp(pattern, flagStr.includes('g') ? flagStr : `${flagStr}g`);
      const found = Array.from(testText.matchAll(re));
      return { matches: found, error: '' };
    } catch (e) {
      return { matches: [], error: e instanceof Error ? e.message : '正则无效' };
    }
  }, [pattern, testText, flags]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <span className="flex items-center rounded-l-2xl border border-r-0 border-[#dfd3ff] bg-[#f3edff] px-3 text-sm text-[#7b69a5] dark:border-[#33274f] dark:bg-[#1c1530] dark:text-[#af9fda] sm:rounded-l-2xl">
          /
        </span>
        <input
          className={`${inputClass} font-mono`}
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="输入正则表达式"
        />
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {(['g', 'i', 'm', 's', 'u'] as const).map((f) => (
          <label key={f} className="flex items-center gap-1.5 text-[#5c4a88] dark:text-[#d2c6f3]">
            <input
              type="checkbox"
              checked={flags[f]}
              onChange={(e) => setFlags((prev) => ({ ...prev, [f]: e.target.checked }))}
              className="accent-[#5b3df5]"
            />
            {f}
          </label>
        ))}
      </div>
      <textarea
        className={`${inputClass} min-h-[120px] resize-y font-mono`}
        value={testText}
        onChange={(e) => setTestText(e.target.value)}
        placeholder="输入要匹配的测试文本"
      />
      {error ? (
        <div className="rounded-2xl border border-[#ffd4dc] bg-[#fff1f3] px-4 py-3 text-sm text-[#c4304a] dark:border-[#5a2433] dark:bg-[#2a141b] dark:text-[#ff9aab]">
          {error}
        </div>
      ) : (
        <div className={outBox}>
          <div className="mb-2 text-xs text-[#7b69a5] dark:text-[#af9fda]">
            共匹配 {matches.length} 处
          </div>
          <div className="flex flex-wrap gap-2">
            {matches.map((m, i) => (
              <span
                key={i}
                className="rounded-full border border-[#dacdff] bg-[#f7f1ff] px-3 py-1 text-xs text-[#543c8f] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]"
              >
                {m[0]}
              </span>
            ))}
            {matches.length === 0 && (
              <span className="text-sm text-[#7b69a5] dark:text-[#af9fda]">无匹配</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ 颜色工具 ============================ */
function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(m)) return null;
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
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
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function relLuminance([r, g, b]: [number, number, number]) {
  const a = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.4 * a[2];
}

export function ColorTool() {
  const [color, setColor] = useState('#5b3df5');
  const [fg, setFg] = useState('#ffffff');
  const [bg, setBg] = useState('#5b3df5');
  const [gradFrom, setGradFrom] = useState('#5b3df5');
  const [gradTo, setGradTo] = useState('#b79bff');
  const [angle, setAngle] = useState('135');

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(...rgb) : null;

  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  let ratio = 0;
  if (fgRgb && bgRgb) {
    const l1 = relLuminance(fgRgb);
    const l2 = relLuminance(bgRgb);
    ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  const gradientCss = `linear-gradient(${angle}deg, ${gradFrom}, ${gradTo})`;

  const badge = (ok: boolean, text: string) => (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        ok
          ? 'bg-[#e6f8ee] text-[#0f8f4f] dark:bg-[#163524] dark:text-[#7ee0a6]'
          : 'bg-[#fdeaec] text-[#c4304a] dark:bg-[#2a141b] dark:text-[#ff9aab]',
      )}
    >
      {text} {ok ? '✓' : '✗'}
    </span>
  );

  return (
    <div className="space-y-5">
      {/* 转换 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">颜色转换</div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={rgb ? color : '#5b3df5'}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-lg border border-[#dfd3ff] bg-transparent dark:border-[#33274f]"
            aria-label="选择颜色"
          />
          <Input className={inputClass} value={color} onChange={(e) => setColor(e.target.value)} placeholder="#5b3df5" />
        </div>
        {rgb && hsl && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: 'HEX', value: rgbToHex(...rgb) },
              { label: 'RGB', value: `rgb(${rgb.join(', ')})` },
              { label: 'HSL', value: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
            ].map((c) => (
              <div key={c.label} className={`${outBox} flex items-center justify-between gap-2`}>
                <div>
                  <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{c.label}</div>
                  <div className="font-mono text-sm text-[#3a2c63] dark:text-[#e6def9]">{c.value}</div>
                </div>
                <CopyButton text={c.value} label="" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 对比度 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">对比度检测 (WCAG)</div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input type="color" value={fgRgb ? fg : '#ffffff'} onChange={(e) => setFg(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" aria-label="前景色" />
            <Input className={inputClass} value={fg} onChange={(e) => setFg(e.target.value)} placeholder="前景色" />
          </div>
          <div className="flex items-center gap-2">
            <input type="color" value={bgRgb ? bg : '#5b3df5'} onChange={(e) => setBg(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" aria-label="背景色" />
            <Input className={inputClass} value={bg} onChange={(e) => setBg(e.target.value)} placeholder="背景色" />
          </div>
        </div>
        <div className={outBox}>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-lg px-3 py-1.5 text-sm"
              style={{ color: fg, backgroundColor: bg }}
            >
              示例文本 Aa
            </span>
            <span className="text-sm font-semibold text-[#3a2c63] dark:text-[#f1ebff]">
              对比度 {ratio.toFixed(2)}:1
            </span>
            <div className="flex flex-wrap gap-1.5">
              {badge(ratio >= 4.5, 'AA 正文')}
              {badge(ratio >= 3, 'AA 大字')}
              {badge(ratio >= 7, 'AAA 正文')}
            </div>
          </div>
        </div>
      </div>

      {/* 渐变 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">CSS 渐变生成</div>
        <div className="flex flex-wrap items-center gap-2">
          <input type="color" value={gradFrom} onChange={(e) => setGradFrom(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" aria-label="起始色" />
          <input type="color" value={gradTo} onChange={(e) => setGradTo(e.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border border-[#dfd3ff] dark:border-[#33274f]" aria-label="结束色" />
          <Input
            className={`${inputClass} max-w-[120px]`}
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            placeholder="角度"
            inputMode="numeric"
          />
          <span className="text-sm text-[#7b69a5] dark:text-[#af9fda]">deg</span>
        </div>
        <div className="h-16 w-full rounded-2xl border border-[#ece3ff] dark:border-[#2c2347]" style={{ background: gradientCss }} />
        <div className={`${outBox} flex items-center justify-between gap-2`}>
          <code className="break-all font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">
            background: {gradientCss};
          </code>
          <CopyButton text={`background: ${gradientCss};`} label="" />
        </div>
      </div>
    </div>
  );
}

/* ========================= JSON ↔ CSV 互转 ========================= */
function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return '';
  const headers = Array.from(
    arr.reduce((set: Set<string>, row: any) => {
      if (row && typeof row === 'object') Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set<string>()),
  ) as string[];
  const escape = (v: any) => {
    if (v == null) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const row of arr) {
    lines.push(headers.map((h) => escape(row?.[h])).join(','));
  }
  return lines.join('\n');
}
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') inQuotes = false;
      else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      result.push(cur);
      cur = '';
    } else cur += ch;
  }
  result.push(cur);
  return result;
}
function csvToJson(csv: string): string {
  const rows = csv.trim().split(/\r?\n/);
  if (rows.length === 0) return '[]';
  const headers = parseCsvLine(rows[0]);
  const out = rows.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ''));
    return obj;
  });
  return JSON.stringify(out, null, 2);
}

export function DataConvertTool() {
  const [mode, setMode] = useState<'json2csv' | 'csv2json'>('json2csv');
  const [input, setInput] = useState('[\n  { "name": "张三", "age": 28 },\n  { "name": "李四", "age": 32 }\n]');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function convert() {
    setError('');
    try {
      setOutput(mode === 'json2csv' ? jsonToCsv(input) : csvToJson(input));
    } catch (e) {
      setOutput('');
      setError(e instanceof Error ? e.message : '转换失败，请检查输入格式。');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(
          [
            { id: 'json2csv', label: 'JSON → CSV' },
            { id: 'csv2json', label: 'CSV → JSON' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition',
              mode === m.id
                ? 'bg-[#5b3df5] text-white'
                : 'bg-[#efe8ff] text-[#5b3df5] dark:bg-[#221635] dark:text-[#d9ccff]',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <textarea
        className={`${inputClass} min-h-[140px] resize-y font-mono text-xs`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'json2csv' ? '粘贴 JSON 数组' : '粘贴 CSV 文本'}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={convert} className="bg-[#5b3df5] text-white hover:bg-[#4f31d7]">
          转换
        </Button>
        {output && <CopyButton text={output} />}
      </div>
      {error && (
        <div className="rounded-2xl border border-[#ffd4dc] bg-[#fff1f3] px-4 py-3 text-sm text-[#c4304a] dark:border-[#5a2433] dark:bg-[#2a141b] dark:text-[#ff9aab]">
          {error}
        </div>
      )}
      {output && (
        <textarea className={`${inputClass} min-h-[140px] resize-y font-mono text-xs`} value={output} readOnly />
      )}
    </div>
  );
}

/* ============================ favicon 生成 ============================ */
const FAVICON_SIZES = [16, 32, 48, 64, 180, 512];

export function FaviconTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<{ size: number; url: string }[]>([]);
  const [fileName, setFileName] = useState('');

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const generated: { size: number; url: string }[] = [];
        for (const size of FAVICON_SIZES) {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            generated.push({ size, url: canvas.toDataURL('image/png') });
          }
        }
        setResults(generated);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  const snippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`;

  return (
    <div className="space-y-3">
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#cdbcff] bg-white/60 px-4 py-6 text-center transition hover:border-[#8b6bff] hover:bg-[#f5f0ff] dark:border-[#3a2f58] dark:bg-white/[0.03]"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ece3ff] text-[#5b3df5] dark:bg-[#2b1f43] dark:text-[#cbbcff]">
          <Upload className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">
          {fileName || '点击或拖拽图片（建议正方形）'}
        </span>
        <span className="text-xs text-[#7b69a5] dark:text-[#af9fda]">本地生成多尺寸 PNG 图标</span>
      </label>

      {results.length > 0 && (
        <>
          <div className="flex flex-wrap items-end gap-4">
            {results.map((r) => (
              <div key={r.size} className="flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={`favicon ${r.size}`} width={Math.min(r.size, 64)} height={Math.min(r.size, 64)} className="rounded border border-[#ece3ff] dark:border-[#2c2347]" />
                <a
                  href={r.url}
                  download={`favicon-${r.size}x${r.size}.png`}
                  className="inline-flex items-center gap-1 text-xs text-[#5b3df5] hover:underline dark:text-[#cbbcff]"
                >
                  <Download className="h-3 w-3" />
                  {r.size}px
                </a>
              </div>
            ))}
          </div>
          <div className={`${outBox} flex items-start justify-between gap-2`}>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">
              {snippet}
            </pre>
            <CopyButton text={snippet} label="" />
          </div>
        </>
      )}
    </div>
  );
}
