'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const inputClass =
  'w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] placeholder:text-[#75689e] shadow-sm outline-none transition focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]';

const outBox =
  'rounded-2xl border border-[#ece3ff] bg-white/60 p-3 text-sm dark:border-[#2c2347] dark:bg-white/[0.03]';

const errBox =
  'rounded-2xl border border-[#ffd4dc] bg-[#fff1f3] px-4 py-3 text-sm text-[#c4304a] dark:border-[#5a2433] dark:bg-[#2a141b] dark:text-[#ff9aab]';

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

/* ============================ JWT 解码 ============================ */
function base64UrlDecode(input: string): string {
  let str = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  const decoded = atob(str);
  try {
    return decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
  } catch {
    return decoded;
  }
}

export function JwtDecodeTool() {
  const [token, setToken] = useState('');
  const result = useMemo(() => {
    if (!token.trim()) return null;
    const parts = token.trim().split('.');
    if (parts.length < 2) return { error: 'JWT 格式不正确（应为 header.payload.signature）。' };
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      return { header, payload };
    } catch {
      return { error: '解析失败，请检查 Token 是否完整有效。' };
    }
  }, [token]);

  const renderDates = (payload: Record<string, any>) => {
    const keys = ['iat', 'exp', 'nbf'];
    const labels: Record<string, string> = { iat: '签发时间', exp: '过期时间', nbf: '生效时间' };
    const rows = keys.filter((k) => payload[k]).map((k) => ({
      label: labels[k],
      value: new Date(payload[k] * 1000).toLocaleString('zh-CN'),
      expired: k === 'exp' && payload[k] * 1000 < Date.now(),
    }));
    if (rows.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {rows.map((r) => (
          <span
            key={r.label}
            className={cn(
              'rounded-full border px-3 py-1',
              r.expired
                ? 'border-[#ffd4dc] bg-[#fff1f3] text-[#c4304a] dark:border-[#5a2433] dark:bg-[#2a141b] dark:text-[#ff9aab]'
                : 'border-[#dacdff] bg-[#f7f1ff] text-[#543c8f] dark:border-[#392d56] dark:bg-[#211834] dark:text-[#d8ccff]',
            )}
          >
            {r.label}：{r.value}
            {r.expired ? '（已过期）' : ''}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[100px] resize-y font-mono text-xs`}
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="粘贴 JWT Token（eyJ...）"
      />
      {result?.error && <div className={errBox}>{result.error}</div>}
      {result && !result.error && (
        <div className="space-y-3">
          <div className={outBox}>
            <div className="mb-1 text-xs font-medium text-[#7b69a5] dark:text-[#af9fda]">Header</div>
            <pre className="overflow-x-auto font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">
              {JSON.stringify(result.header, null, 2)}
            </pre>
          </div>
          <div className={outBox}>
            <div className="mb-1 text-xs font-medium text-[#7b69a5] dark:text-[#af9fda]">Payload</div>
            <pre className="overflow-x-auto font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">
              {JSON.stringify(result.payload, null, 2)}
            </pre>
            {renderDates(result.payload)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================ Cron 表达式 ============================ */
function parseCronField(field: string, min: number, max: number): number[] {
  const values = new Set<number>();
  for (const part of field.split(',')) {
    let step = 1;
    let range = part;
    const slash = part.split('/');
    if (slash.length === 2) {
      range = slash[0];
      step = parseInt(slash[1], 10) || 1;
    }
    let start = min;
    let end = max;
    if (range !== '*') {
      const dash = range.split('-');
      start = parseInt(dash[0], 10);
      end = dash.length === 2 ? parseInt(dash[1], 10) : start;
    }
    if (Number.isNaN(start) || Number.isNaN(end)) throw new Error('字段解析失败');
    for (let v = start; v <= end; v += step) {
      if (v >= min && v <= max) values.add(v);
    }
  }
  return Array.from(values).sort((a, b) => a - b);
}

export function CronTool() {
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const result = useMemo(() => {
    const fields = expr.trim().split(/\s+/);
    if (fields.length !== 5) return { error: '请输入标准 5 段 cron：分 时 日 月 周' };
    try {
      const minute = parseCronField(fields[0], 0, 59);
      const hour = parseCronField(fields[1], 0, 23);
      const dom = parseCronField(fields[2], 1, 31);
      const month = parseCronField(fields[3], 1, 12);
      const dow = parseCronField(fields[4], 0, 6);
      const domRestricted = fields[2] !== '*';
      const dowRestricted = fields[4] !== '*';

      const runs: string[] = [];
      const cursor = new Date();
      cursor.setSeconds(0, 0);
      cursor.setMinutes(cursor.getMinutes() + 1);
      const limit = 525600; // 1 year of minutes
      let i = 0;
      while (runs.length < 5 && i < limit) {
        const matchDom = dom.includes(cursor.getDate());
        const matchDow = dow.includes(cursor.getDay());
        const dayOk =
          domRestricted && dowRestricted ? matchDom || matchDow : matchDom && matchDow;
        if (
          minute.includes(cursor.getMinutes()) &&
          hour.includes(cursor.getHours()) &&
          month.includes(cursor.getMonth() + 1) &&
          dayOk
        ) {
          runs.push(cursor.toLocaleString('zh-CN'));
        }
        cursor.setMinutes(cursor.getMinutes() + 1);
        i++;
      }
      return { runs };
    } catch {
      return { error: 'cron 表达式解析失败，请检查格式。' };
    }
  }, [expr]);

  return (
    <div className="space-y-3">
      <Input
        className={`${inputClass} font-mono`}
        value={expr}
        onChange={(e) => setExpr(e.target.value)}
        placeholder="分 时 日 月 周，例如 0 9 * * 1-5"
      />
      <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
        字段顺序：分钟(0-59) 小时(0-23) 日(1-31) 月(1-12) 星期(0-6，0=周日)
      </div>
      {result.error ? (
        <div className={errBox}>{result.error}</div>
      ) : (
        <div className={outBox}>
          <div className="mb-2 text-xs font-medium text-[#7b69a5] dark:text-[#af9fda]">
            接下来 5 次执行时间
          </div>
          <ul className="space-y-1 text-sm text-[#3a2c63] dark:text-[#e6def9]">
            {result.runs?.length ? (
              result.runs.map((r, i) => <li key={i}>· {r}</li>)
            ) : (
              <li className="text-[#7b69a5] dark:text-[#af9fda]">一年内没有匹配的执行时间</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================ SHA 哈希 ============================ */
export function ShaHashTool() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!text) {
        setHashes({});
        return;
      }
      const algos: [string, string][] = [
        ['SHA-1', 'SHA-1'],
        ['SHA-256', 'SHA-256'],
        ['SHA-384', 'SHA-384'],
        ['SHA-512', 'SHA-512'],
      ];
      const data = new TextEncoder().encode(text);
      const next: Record<string, string> = {};
      for (const [label, algo] of algos) {
        try {
          const buf = await crypto.subtle.digest(algo, data);
          next[label] = Array.from(new Uint8Array(buf))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
        } catch {
          next[label] = '不支持';
        }
      }
      if (!cancelled) setHashes(next);
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="space-y-3">
      <textarea
        className={`${inputClass} min-h-[100px] resize-y`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入要计算哈希的文本"
      />
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-2">
          {Object.entries(hashes).map(([algo, value]) => (
            <div key={algo} className={`${outBox} flex items-center justify-between gap-2`}>
              <div className="min-w-0">
                <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{algo}</div>
                <div className="break-all font-mono text-xs text-[#3a2c63] dark:text-[#e6def9]">{value}</div>
              </div>
              <CopyButton text={value} label="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ 进制转换 ============================ */
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
function convertBase(value: string, from: number, to: number): string {
  const clean = value.trim().toLowerCase();
  if (!clean) return '';
  let n = BigInt(0);
  for (const ch of clean) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= from) throw new Error(`字符 "${ch}" 不属于 ${from} 进制`);
    n = n * BigInt(from) + BigInt(d);
  }
  if (n === BigInt(0)) return '0';
  let out = '';
  const toBig = BigInt(to);
  while (n > BigInt(0)) {
    out = DIGITS[Number(n % toBig)] + out;
    n /= toBig;
  }
  return out;
}

export function BaseConvertTool() {
  const [value, setValue] = useState('255');
  const [from, setFrom] = useState('10');
  const presets = [
    { base: 2, label: '二进制' },
    { base: 8, label: '八进制' },
    { base: 10, label: '十进制' },
    { base: 16, label: '十六进制' },
  ];
  const { results, error } = useMemo(() => {
    try {
      const fromBase = parseInt(from, 10);
      if (fromBase < 2 || fromBase > 36) throw new Error('进制需在 2-36 之间');
      const res = presets.map((p) => ({
        ...p,
        value: convertBase(value, fromBase, p.base).toUpperCase(),
      }));
      return { results: res, error: '' };
    } catch (e) {
      return { results: [], error: e instanceof Error ? e.message : '转换失败' };
    }
  }, [value, from]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className={`${inputClass} font-mono`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入数值"
        />
        <Input
          className={`${inputClass} sm:max-w-[160px]`}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="源进制(2-36)"
          inputMode="numeric"
        />
      </div>
      {error ? (
        <div className={errBox}>{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {results.map((r) => (
            <div key={r.base} className={`${outBox} flex items-center justify-between gap-2`}>
              <div className="min-w-0">
                <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                  {r.label}（{r.base}）
                </div>
                <div className="break-all font-mono text-sm text-[#3a2c63] dark:text-[#e6def9]">{r.value}</div>
              </div>
              <CopyButton text={r.value} label="" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ 文本 Diff 对比 ============================ */
function diffLines(a: string[], b: string[]) {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: { type: 'same' | 'add' | 'del'; text: string }[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ type: 'same', text: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: 'del', text: a[i] });
      i++;
    } else {
      out.push({ type: 'add', text: b[j] });
      j++;
    }
  }
  while (i < m) out.push({ type: 'del', text: a[i++] });
  while (j < n) out.push({ type: 'add', text: b[j++] });
  return out;
}

export function TextDiffTool() {
  const [left, setLeft] = useState('');
  const [right, setRight] = useState('');
  const diff = useMemo(
    () => diffLines(left.split(/\r?\n/), right.split(/\r?\n/)),
    [left, right],
  );
  const hasInput = left.trim() !== '' || right.trim() !== '';

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <textarea
          className={`${inputClass} min-h-[120px] resize-y font-mono text-xs`}
          value={left}
          onChange={(e) => setLeft(e.target.value)}
          placeholder="原始文本"
        />
        <textarea
          className={`${inputClass} min-h-[120px] resize-y font-mono text-xs`}
          value={right}
          onChange={(e) => setRight(e.target.value)}
          placeholder="对比文本"
        />
      </div>
      {hasInput && (
        <div className={`${outBox} space-y-0.5 font-mono text-xs`}>
          {diff.map((line, i) => (
            <div
              key={i}
              className={cn(
                'whitespace-pre-wrap break-all px-2 py-0.5',
                line.type === 'add' && 'bg-[#e6f8ee] text-[#0f8f4f] dark:bg-[#163524] dark:text-[#7ee0a6]',
                line.type === 'del' && 'bg-[#fdeaec] text-[#c4304a] line-through dark:bg-[#2a141b] dark:text-[#ff9aab]',
                line.type === 'same' && 'text-[#3a2c63] dark:text-[#e6def9]',
              )}
            >
              {line.type === 'add' ? '+ ' : line.type === 'del' ? '- ' : '  '}
              {line.text || ' '}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================ 命名转换 ============================ */
function splitWords(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-./\\]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function CaseConvertTool() {
  const [text, setText] = useState('hello world example');
  const words = useMemo(() => splitWords(text), [text]);
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  const formats = [
    { label: 'camelCase', value: words.map((w, i) => (i === 0 ? w : cap(w))).join('') },
    { label: 'PascalCase', value: words.map(cap).join('') },
    { label: 'snake_case', value: words.join('_') },
    { label: 'kebab-case', value: words.join('-') },
    { label: 'CONSTANT_CASE', value: words.join('_').toUpperCase() },
    { label: 'Title Case', value: words.map(cap).join(' ') },
  ];

  return (
    <div className="space-y-3">
      <Input
        className={inputClass}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入任意命名，如 hello world / helloWorld / hello_world"
      />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {formats.map((f) => (
          <div key={f.label} className={`${outBox} flex items-center justify-between gap-2`}>
            <div className="min-w-0">
              <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{f.label}</div>
              <div className="break-all font-mono text-sm text-[#3a2c63] dark:text-[#e6def9]">{f.value}</div>
            </div>
            <CopyButton text={f.value} label="" />
          </div>
        ))}
      </div>
    </div>
  );
}
