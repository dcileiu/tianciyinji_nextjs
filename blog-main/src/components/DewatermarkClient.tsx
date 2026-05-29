'use client';

import {
  ClipboardPaste,
  Copy,
  ExternalLink,
  Eraser,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';
import { HapticFeedback, triggerHaptic } from '@/utils/haptics';

type Platform = 'wechat' | 'douyin' | 'xhs' | 'unknown';

interface ResourceItem {
  title: string;
  url: string;
  extra?: string;
}

interface ResourceGroup {
  label: string;
  items: ResourceItem[];
}

interface UnifiedResult {
  platform: Exclude<Platform, 'unknown'>;
  platformName: string;
  title: string;
  summary: string;
  sourceUrl: string;
  type: string;
  authorName: string;
  accountName: string;
  publishTime: string;
  tags: string[];
  stats: { label: string; value: number }[];
  resources: ResourceGroup[];
}

const PLATFORM_META: Record<Platform, { name: string; chip: string }> = {
  wechat: {
    name: '公众号',
    chip: 'border-[#1aad19]/30 bg-[#1aad19]/10 text-[#0f8f1f] dark:text-[#7ee787]',
  },
  douyin: {
    name: '抖音',
    chip: 'border-[#fe2c55]/30 bg-[#fe2c55]/10 text-[#d81e44] dark:text-[#ff7a93]',
  },
  xhs: {
    name: '小红书',
    chip: 'border-[#ff2442]/30 bg-[#ff2442]/10 text-[#e01e38] dark:text-[#ff8198]',
  },
  unknown: {
    name: '未知',
    chip: 'border-[#d9ccff] bg-white/70 text-[#7b69a5] dark:border-[#3a2f58] dark:bg-white/[0.05] dark:text-[#af9fda]',
  },
};

function detectPlatform(value: string): Platform {
  const text = String(value || '');
  if (/mp\.weixin\.qq\.com\/s\//i.test(text)) return 'wechat';
  if (/xhslink\.com\/|xiaohongshu\.com\//i.test(text)) return 'xhs';
  if (/v\.douyin\.com\/|(?:www\.)?douyin\.com\/|(?:www\.)?iesdouyin\.com\//i.test(text)) {
    return 'douyin';
  }
  return 'unknown';
}

function makeStat(label: string, value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return { label, value: num };
}

function normalizeResult(platform: Exclude<Platform, 'unknown'>, payload: any): UnifiedResult {
  if (platform === 'wechat') {
    const wrapper = payload?.data || {};
    const data = wrapper.data;
    if (!data) {
      throw new Error(wrapper.message || '公众号接口没有返回可用数据。');
    }
    return {
      platform,
      platformName: '公众号',
      title: data.title || '未命名内容',
      summary: data.desc || data.contentText || '',
      sourceUrl: data.url || '',
      type: data.type || '文章',
      authorName: data.author || '',
      accountName: data.accountName || '',
      publishTime: data.publishTime || '',
      tags: [],
      stats: [],
      resources: [
        {
          label: '图片',
          items: (data.downloadUrls || []).map((url: string, index: number) => ({
            title: `图片 ${index + 1}`,
            url,
            extra: data.coverImage && index === 0 ? `封面：${data.coverImage}` : '',
          })),
        },
        {
          label: '视频',
          items: (data.liveUrls || [])
            .map((url: string, index: number) => ({ url, index }))
            .filter((item: { url: string }) => item.url)
            .map((item: { url: string; index: number }) => ({
              title: `视频 ${item.index + 1}`,
              url: item.url,
              extra: '',
            })),
        },
      ].filter((group) => group.items.length > 0),
    };
  }

  const wrapper = payload?.data || {};
  const detail = wrapper.data;
  if (!detail) {
    throw new Error(wrapper.message || '接口没有返回可用数据。');
  }

  const tagList = Array.isArray(detail.tags) ? detail.tags : [];
  const stats = [
    makeStat('点赞', detail.likedCount),
    makeStat('收藏', detail.collectedCount),
    makeStat('评论', detail.commentCount),
    makeStat('分享', detail.shareCount),
  ].filter(Boolean) as { label: string; value: number }[];

  const primaryLabel =
    detail.type && String(detail.type).includes('视频') ? '无水印视频' : '无水印资源';
  const liveItems = (detail.liveUrls || [])
    .map((url: string, index: number) => ({ url, index }))
    .filter((item: { url: string }) => item.url)
    .map((item: { url: string; index: number }) => ({
      title: `直播/预览链接 ${item.index + 1}`,
      url: item.url,
      extra: '',
    }));

  return {
    platform,
    platformName: platform === 'douyin' ? '抖音' : '小红书',
    title: detail.title || detail.desc || '未命名内容',
    summary: detail.desc || '',
    sourceUrl: detail.url || '',
    type: detail.type || '',
    authorName: detail.authorName || '',
    accountName: detail.authorId || '',
    publishTime: '',
    tags: tagList,
    stats,
    resources: [
      {
        label: primaryLabel,
        items: (detail.downloadUrls || []).map((url: string, index: number) => ({
          title: `${primaryLabel} ${index + 1}`,
          url,
          extra: '',
        })),
      },
      {
        label: '附加链接',
        items: liveItems,
      },
    ].filter((group) => group.items.length > 0),
  };
}

function countResources(groups: ResourceGroup[]) {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

function flattenUrls(groups: ResourceGroup[]) {
  return groups.flatMap((group) => group.items.map((item) => item.url)).filter(Boolean);
}

export default function DewatermarkClient() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<UnifiedResult | null>(null);
  const [raw, setRaw] = useState<unknown>(null);

  const { copy } = useCopyToClipboard();

  const platform = useMemo(() => detectPlatform(input), [input]);
  const trimmed = input.trim();

  async function handleParse() {
    const value = input.trim();
    if (!value) {
      setError('请先粘贴分享口令或链接。');
      return;
    }
    const detected = detectPlatform(value);
    if (detected === 'unknown') {
      setError('未识别到支持的平台。当前仅支持公众号、抖音、小红书链接。');
      return;
    }

    triggerHaptic(HapticFeedback.Medium);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dewatermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: detected, url: value }),
      });
      const data = await response.json();

      if (!response.ok || data?.code !== 0) {
        const message =
          data?.error || data?.msg || `${PLATFORM_META[detected].name}接口请求失败（HTTP ${response.status}）`;
        throw new Error(message);
      }

      const unified = normalizeResult(detected, data);
      setResult(unified);
      setRaw(data);
      toast.success(`解析成功，已获取 ${countResources(unified.resources)} 条资源。`);
    } catch (err) {
      setResult(null);
      setRaw(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        setError('剪贴板里没有可读取的文本内容。');
        return;
      }
      setInput(text);
      setError('');
      toast.success('已读取剪贴板内容。');
    } catch {
      setError('读取剪贴板失败，请手动粘贴。');
    }
  }

  function handleClear() {
    setInput('');
    setResult(null);
    setRaw(null);
    setError('');
  }

  async function handleCopyAll() {
    if (!result) return;
    const urls = flattenUrls(result.resources);
    if (urls.length === 0) {
      setError('当前结果里没有可复制的资源链接。');
      return;
    }
    await copy(urls.join('\n'));
  }

  const metaItems = result
    ? [
        { label: '平台', value: result.platformName },
        { label: '标题', value: result.title },
        { label: '类型', value: result.type || '未知' },
        {
          label: '作者 / 账号',
          value: [result.authorName, result.accountName].filter(Boolean).join(' / ') || '暂无',
        },
        { label: '发布时间', value: result.publishTime || '暂无' },
        { label: '标签', value: result.tags.length ? result.tags.join(' / ') : '暂无' },
        {
          label: '互动数据',
          value: result.stats.length
            ? result.stats.map((item) => `${item.label} ${item.value}`).join(' / ')
            : '暂无',
        },
      ]
    : [];

  const cardClass =
    'rounded-[26px] border border-[#e4d8ff] bg-white/70 p-5 shadow-[0_18px_55px_rgba(91,61,245,0.08)] dark:border-[#2a2140] dark:bg-white/[0.04] sm:p-6';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:py-20">
      <header className="relative overflow-hidden rounded-[34px] border border-[#e4d8ff] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(244,237,255,0.94))] px-6 py-8 shadow-[0_24px_80px_rgba(91,61,245,0.10)] sm:px-8 sm:py-10 md:px-10 md:py-12 dark:border-[#2a2140] dark:bg-[linear-gradient(135deg,rgba(24,18,43,0.92),rgba(15,11,27,0.96))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(130,96,255,0.16),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(218,208,255,0.18),transparent_30%)]" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#7f71ab] dark:text-[#ab9cd8]">
            <Wand2 className="h-3.5 w-3.5" />
            Watermark Remover
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2e2150] sm:text-4xl md:text-5xl dark:text-[#f4efff]">
            公众号 / 抖音 / 小红书去水印
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#66568f] sm:text-base dark:text-[#c4b6eb]">
            粘贴分享口令或链接，自动识别平台并调用我的去水印接口，返回无水印资源、文章图片与视频候选链接。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['wechat', 'douyin', 'xhs'] as const).map((key) => (
              <span
                key={key}
                className="rounded-full border border-[#d9ccff] bg-white/70 px-3 py-1 text-xs text-[#6b5b97] dark:border-[#3a2f58] dark:bg-white/[0.05] dark:text-[#c7baf1]"
              >
                {PLATFORM_META[key].name}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className={cn(cardClass, 'mt-6')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#312355] dark:text-[#f4efff]">链接输入</h2>
            <p className="mt-1 text-sm text-[#7b69a5] dark:text-[#af9fda]">
              支持完整分享文案、短链、文章链接。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePaste} className="gap-1.5">
              <ClipboardPaste className="h-4 w-4" />
              读取剪贴板
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5">
              <Eraser className="h-4 w-4" />
              清空
            </Button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          placeholder="粘贴公众号文章、抖音、小红书分享链接或完整口令"
          className="mt-4 w-full resize-y rounded-2xl border border-[#ddd0ff] bg-white/80 px-4 py-3 text-sm text-[#312355] outline-none transition placeholder:text-[#a99cce] focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/30 dark:border-[#352b53] dark:bg-white/[0.04] dark:text-[#efe9ff] dark:placeholder:text-[#7c6ca6]"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
              PLATFORM_META[trimmed ? platform : 'unknown'].chip
            )}
          >
            {!trimmed
              ? '未输入分享链接'
              : platform === 'unknown'
                ? '未识别到支持的平台'
                : `已识别：${PLATFORM_META[platform].name}`}
          </span>
          <Button onClick={handleParse} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? '解析中...' : '开始解析'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-[#ffd4dc] bg-[#fff1f3] px-4 py-3 text-sm text-[#c4304a] dark:border-[#5a2433] dark:bg-[#2a141b] dark:text-[#ff9aab]">
            {error}
          </div>
        )}
      </section>

      {result ? (
        <section className={cn(cardClass, 'mt-6')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#312355] dark:text-[#f4efff]">解析结果</h2>
            <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
              <Copy className="h-4 w-4" />
              复制全部链接
            </Button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {metaItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#ece3ff] bg-white/60 px-4 py-3 dark:border-[#2c2347] dark:bg-white/[0.03]"
              >
                <div className="text-xs uppercase tracking-wider text-[#9686c0] dark:text-[#8f7fc0]">
                  {item.label}
                </div>
                <div className="mt-1 break-words text-sm text-[#3a2c63] dark:text-[#e6def9]">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {result.summary && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-[#312355] dark:text-[#f4efff]">摘要</h3>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#5f4e89] dark:text-[#c4b6eb]">
                {result.summary}
              </p>
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#312355] dark:text-[#f4efff]">资源链接</h3>
              <span className="text-xs text-[#7b69a5] dark:text-[#af9fda]">
                {countResources(result.resources)} 条
              </span>
            </div>

            <div className="mt-3 space-y-4">
              {result.resources.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-medium text-[#4f31d7] dark:text-[#cbbcff]">
                      {group.label}
                    </span>
                    <span className="text-xs text-[#9686c0] dark:text-[#8f7fc0]">
                      {group.items.length} 条
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((item, index) => (
                      <article
                        key={`${group.label}-${index}`}
                        className="rounded-2xl border border-[#ece3ff] bg-white/60 p-3 dark:border-[#2c2347] dark:bg-white/[0.03]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[#3a2c63] dark:text-[#e6def9]">
                              {item.title}
                            </div>
                            {item.extra && (
                              <div className="mt-0.5 break-all text-xs text-[#9686c0] dark:text-[#8f7fc0]">
                                {item.extra}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs"
                              onClick={() => copy(item.url)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              复制
                            </Button>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                                <ExternalLink className="h-3.5 w-3.5" />
                                打开
                              </Button>
                            </a>
                          </div>
                        </div>
                        <p className="mt-2 break-all text-xs text-[#8576ad] dark:text-[#9d8ece]">
                          {item.url}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {raw != null && (
            <details className="mt-5 rounded-2xl border border-[#ece3ff] bg-white/50 px-4 py-3 dark:border-[#2c2347] dark:bg-white/[0.03]">
              <summary className="cursor-pointer text-sm font-medium text-[#5f4e89] dark:text-[#c4b6eb]">
                查看原始返回
              </summary>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-[#1c1530] p-3 text-xs leading-relaxed text-[#d8cdff]">
                {JSON.stringify(raw, null, 2)}
              </pre>
            </details>
          )}
        </section>
      ) : (
        <section className={cn(cardClass, 'mt-6 text-center')}>
          <h3 className="text-base font-semibold text-[#312355] dark:text-[#f4efff]">准备就绪</h3>
          <p className="mt-2 text-sm text-[#7b69a5] dark:text-[#af9fda]">
            输入链接后点击“开始解析”，结果会展示在这里。
          </p>
        </section>
      )}
    </div>
  );
}
