'use client';

import { ExternalLink, Loader2, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TrafficData {
  SiteName?: string;
  Description?: string;
  GlobalRank?: { Rank?: number };
  Engagments?: {
    Visits?: string;
    TimeOnSite?: string;
    PagePerVisit?: string;
    BounceRate?: string;
  };
  EstimatedMonthlyVisits?: Record<string, number>;
  TrafficSources?: Record<string, number>;
  TopCountryShares?: Array<{ Country?: number; CountryCode?: string; Value?: number }>;
}

const SOURCE_LABELS: Record<string, string> = {
  Search: '搜索',
  Direct: '直接访问',
  Referrals: '外链引荐',
  Social: '社交媒体',
  Mail: '邮件',
  'Paid Referrals': '付费引荐',
};

const SOURCE_COLORS: Record<string, string> = {
  Search: '#5b3df5',
  Direct: '#8b6bff',
  Referrals: '#6b8bff',
  Social: '#b06bff',
  Mail: '#34c7a8',
  'Paid Referrals': '#f59e42',
};

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['zh-CN'], { type: 'region' })
    : null;

function countryName(code?: string) {
  if (!code) return '未知';
  try {
    return regionNames?.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

function formatCount(value: number) {
  if (!Number.isFinite(value)) return '-';
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}b`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}m`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}k`;
  return String(Math.round(value));
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00:00';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

function TrendChart({ data }: { data: Record<string, number> }) {
  const points = Object.entries(data)
    .map(([date, value]) => ({ date, value: Number(value) || 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) return null;

  const W = 560;
  const H = 200;
  const padL = 44;
  const padR = 14;
  const padT = 16;
  const padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const max = Math.max(...points.map((p) => p.value), 1);

  const xFor = (i: number) =>
    points.length === 1 ? padL + plotW / 2 : padL + (i * plotW) / (points.length - 1);
  const yFor = (v: number) => padT + plotH - (v / max) * plotH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(1)} ${padT + plotH} L ${xFor(0).toFixed(1)} ${padT + plotH} Z`;

  const formatMonth = (date: string) => {
    const [y, m] = date.split('-');
    return `${y}/${m}`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="访问趋势">
      <defs>
        <linearGradient id="traffic-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b6bff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b6bff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((ratio) => {
        const y = padT + plotH - ratio * plotH;
        return (
          <g key={ratio}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeDasharray="4 4"
            />
            <text x={padL - 8} y={y + 4} textAnchor="end" className="fill-current text-[10px] opacity-50">
              {formatCount(max * ratio)}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill="url(#traffic-area)" />
      <path d={linePath} fill="none" stroke="#5b3df5" strokeWidth="2.5" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={p.date}>
          <circle cx={xFor(i)} cy={yFor(p.value)} r="3.5" fill="#5b3df5" />
          <text
            x={xFor(i)}
            y={H - 10}
            textAnchor="middle"
            className="fill-current text-[10px] opacity-60"
          >
            {formatMonth(p.date)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SourcesDonut({ sources }: { sources: Record<string, number> }) {
  const entries = Object.entries(sources)
    .map(([key, value]) => ({ key, value: Number(value) || 0 }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const total = entries.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    return <p className="text-sm text-[#7b69a5] dark:text-[#af9fda]">暂无流量来源数据。</p>;
  }

  const size = 180;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let offsetAcc = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={stroke} />
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {entries.map((item) => {
            const fraction = item.value / total;
            const dash = fraction * circumference;
            const segment = (
              <circle
                key={item.key}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={SOURCE_COLORS[item.key] || '#a78bfa'}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offsetAcc}
              />
            );
            offsetAcc += dash;
            return segment;
          })}
        </g>
      </svg>

      <div className="w-full space-y-2">
        {entries.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: SOURCE_COLORS[item.key] || '#a78bfa' }}
            />
            <span className="text-[#3a2c63] dark:text-[#e6def9]">
              {SOURCE_LABELS[item.key] || item.key}
            </span>
            <span className="ml-auto font-medium text-[#5b3df5] dark:text-[#cbbcff]">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SiteTrafficTool() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<TrafficData | null>(null);

  async function handleAnalyze() {
    const value = domain.trim();
    if (!value) {
      setError('请输入要查询的域名。');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/site-traffic?domain=${encodeURIComponent(value)}`);
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error || `查询失败（HTTP ${response.status}）`);
      }
      setData(json);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const engagements = data?.Engagments;
  const stats = engagements
    ? [
        { label: '月访问量', value: formatCount(Number(engagements.Visits)) },
        { label: '平均访问时长', value: formatDuration(Number(engagements.TimeOnSite)) },
        { label: '每次访问页数', value: (Number(engagements.PagePerVisit) || 0).toFixed(2) },
        {
          label: '跳出率',
          value: `${((Number(engagements.BounceRate) || 0) * 100).toFixed(2)}%`,
        },
      ]
    : [];

  const countries = (data?.TopCountryShares || [])
    .filter((item) => (item.Value || 0) > 0)
    .slice(0, 5);

  const panelClass =
    'rounded-2xl border border-[#ece3ff] bg-white/60 p-4 dark:border-[#2c2347] dark:bg-white/[0.03]';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          className="w-full rounded-2xl border border-[#dfd3ff] bg-white/80 px-4 py-3 text-sm text-[#2f2154] outline-none transition placeholder:text-[#75689e] focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/20 dark:border-[#33274f] dark:bg-[#140f22]/90 dark:text-[#f4efff] dark:placeholder:text-[#ae9fda]"
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAnalyze();
          }}
          placeholder="输入域名，例如 example.com"
        />
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="shrink-0 gap-1.5 rounded-2xl bg-[#5b3df5] text-white hover:bg-[#4f31d7]"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? '分析中...' : '流量分析'}
        </Button>
      </div>

      <p className="text-xs leading-6 text-[#7b69a5] dark:text-[#af9fda]">
        数据来自 SimilarWeb 公开估算，仅供参考；小流量或未收录的站点可能查不到。
      </p>

      {error && (
        <div className="rounded-2xl border border-[#ffd4dc] bg-[#fff1f3] px-4 py-3 text-sm text-[#c4304a] dark:border-[#5a2433] dark:bg-[#2a141b] dark:text-[#ff9aab]">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* 概览 */}
          <div className={panelClass}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-lg font-semibold text-[#2e2150] dark:text-[#f4efff]">
                    {data.SiteName || domain}
                  </h4>
                  <a
                    href={`https://${data.SiteName || domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8b6bff] transition hover:text-[#5b3df5]"
                    aria-label="打开网站"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                {data.Description && (
                  <p className="mt-1 line-clamp-2 text-sm text-[#66568f] dark:text-[#c4b6eb]">
                    {data.Description}
                  </p>
                )}
              </div>
              {data.GlobalRank?.Rank ? (
                <div className="shrink-0 text-right">
                  <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">全球排名</div>
                  <div className="text-xl font-semibold text-[#5b3df5] dark:text-[#cbbcff]">
                    {data.GlobalRank.Rank.toLocaleString()}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* 指标卡片 */}
          {stats.length > 0 && (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className={cn(panelClass, 'text-center')}>
                  <div className="text-xs text-[#7b69a5] dark:text-[#af9fda]">{stat.label}</div>
                  <div className="mt-1 text-lg font-semibold text-[#3a2c63] dark:text-[#f1ebff]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 访问趋势 */}
          {data.EstimatedMonthlyVisits && Object.keys(data.EstimatedMonthlyVisits).length > 0 && (
            <div className={cn(panelClass, 'text-[#5b3df5] dark:text-[#cbbcff]')}>
              <div className="mb-2 text-sm font-semibold text-[#312355] dark:text-[#f4efff]">
                访问趋势
              </div>
              <TrendChart data={data.EstimatedMonthlyVisits} />
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* 流量来源 */}
            {data.TrafficSources && (
              <div className={panelClass}>
                <div className="mb-3 text-sm font-semibold text-[#312355] dark:text-[#f4efff]">
                  流量来源
                </div>
                <SourcesDonut sources={data.TrafficSources} />
              </div>
            )}

            {/* 主要地区 */}
            {countries.length > 0 && (
              <div className={panelClass}>
                <div className="mb-3 text-sm font-semibold text-[#312355] dark:text-[#f4efff]">
                  主要地区
                </div>
                <div className="space-y-2.5">
                  {countries.map((country) => {
                    const pct = (country.Value || 0) * 100;
                    return (
                      <div key={country.CountryCode || country.Country}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[#3a2c63] dark:text-[#e6def9]">
                            {countryName(country.CountryCode)}
                          </span>
                          <span className="font-medium text-[#5b3df5] dark:text-[#cbbcff]">
                            {pct.toFixed(2)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#ece3ff] dark:bg-[#2b1f43]">
                          <div
                            className="h-full rounded-full bg-[#8b6bff]"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
