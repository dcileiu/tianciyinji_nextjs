'use client';

import { ClipboardPaste, Copy, Eraser, ExternalLink, Loader2, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useI18n } from '@/components/I18nProvider';
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

const platformStyle: Record<Platform, string> = {
  wechat: 'border-[#1aad19]/30 bg-[#1aad19]/10 text-[#0f8f1f] dark:text-[#7ee787]',
  douyin: 'border-[#fe2c55]/30 bg-[#fe2c55]/10 text-[#d81e44] dark:text-[#ff7a93]',
  xhs: 'border-[#ff2442]/30 bg-[#ff2442]/10 text-[#e01e38] dark:text-[#ff8198]',
  unknown: 'border-[#d9ccff] bg-white/70 text-[#7b69a5] dark:border-[#3a2f58] dark:bg-white/[0.05] dark:text-[#af9fda]',
};

function detectPlatform(value: string): Platform {
  const text = String(value || '');
  if (/mp\.weixin\.qq\.com\/s\//i.test(text)) return 'wechat';
  if (/xhslink\.com\/|xiaohongshu\.com\//i.test(text)) return 'xhs';
  if (/v\.douyin\.com\/|(?:www\.)?douyin\.com\/|(?:www\.)?iesdouyin\.com\//i.test(text)) return 'douyin';
  return 'unknown';
}

function countResources(groups: ResourceGroup[]) {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

function flattenUrls(groups: ResourceGroup[]) {
  return groups.flatMap((group) => group.items.map((item) => item.url)).filter(Boolean);
}

function makeStat(label: string, value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return { label, value: num };
}

function labels(locale: 'zh-CN' | 'en') {
  return locale === 'en'
    ? {
        platformName: { wechat: 'WeChat Official Account', douyin: 'Douyin', xhs: 'Xiaohongshu', unknown: 'Unknown' },
        title: 'WeChat / Douyin / Xiaohongshu Dewatermark',
        subtitle:
          'Paste a share link or command text. The tool detects the platform and returns clean images, videos, and article resource links.',
        inputTitle: 'Link Input',
        inputHint: 'Supports full share text, short links, and article URLs.',
        paste: 'Read clipboard',
        clear: 'Clear',
        placeholder: 'Paste a WeChat article, Douyin, or Xiaohongshu share link or full command text',
        notEntered: 'No share link yet',
        unsupported: 'Unsupported platform',
        ready: (name: string) => `Ready for ${name}`,
        parse: 'Parse',
        parsing: 'Parsing...',
        resultTitle: 'Parsed Result',
        copyAll: 'Copy all links',
        details: 'Details',
        resources: 'Resources',
        raw: 'View raw response',
        rawTitle: 'Raw Response',
        rawHint: 'For debugging only. It may include upstream service fields.',
        platform: 'Platform',
        contentTitle: 'Title',
        type: 'Type',
        author: 'Author / Account',
        publishTime: 'Publish time',
        tags: 'Tags',
        stats: 'Stats',
        none: 'None',
        unknown: 'Unknown',
        article: 'Article',
        image: 'Image',
        video: 'Video',
        images: 'Images',
        videos: 'Videos',
        cleanResource: 'Clean resource',
        cleanVideo: 'Clean video',
        extraLinks: 'Extra links',
        cover: 'Cover',
        preview: 'Live / preview link',
        unnamed: 'Untitled content',
        noWechatData: 'The WeChat API did not return usable data.',
        noData: 'The API did not return usable data.',
        needInput: 'Please paste a share link or command text first.',
        needSupported: 'Unsupported platform. Only WeChat Official Account, Douyin, and Xiaohongshu links are supported.',
        clipboardEmpty: 'The clipboard does not contain readable text.',
        clipboardRead: 'Clipboard content loaded.',
        clipboardFailed: 'Failed to read the clipboard. Please paste manually.',
        noLinks: 'There are no resource links to copy in the current result.',
        success: (count: number) => `Parsed successfully. ${count} resources found.`,
        copyOne: 'Copy',
        open: 'Open',
        copied: 'Copied',
        requestFailed: (name: string, status: number) => `${name} request failed (HTTP ${status}).`,
        statNames: { likes: 'Likes', saves: 'Saves', comments: 'Comments', shares: 'Shares' },
      }
    : {
        platformName: { wechat: '公众号', douyin: '抖音', xhs: '小红书', unknown: '未知' },
        title: '公众号 / 抖音 / 小红书去水印',
        subtitle: '粘贴分享口令或链接，自动识别平台并调用去水印接口，返回无水印资源、文章图片与视频候选链接。',
        inputTitle: '链接输入',
        inputHint: '支持完整分享文案、短链、文章链接。',
        paste: '读取剪贴板',
        clear: '清空',
        placeholder: '粘贴公众号文章、抖音、小红书分享链接或完整口令',
        notEntered: '未输入分享链接',
        unsupported: '未识别到支持的平台',
        ready: (name: string) => `已识别：${name}`,
        parse: '开始解析',
        parsing: '解析中...',
        resultTitle: '解析结果',
        copyAll: '复制全部链接',
        details: '详情',
        resources: '资源链接',
        raw: '查看原始返回',
        rawTitle: '原始返回',
        rawHint: '仅用于排查问题，可能包含上游服务字段。',
        platform: '平台',
        contentTitle: '标题',
        type: '类型',
        author: '作者 / 账号',
        publishTime: '发布时间',
        tags: '标签',
        stats: '互动数据',
        none: '暂无',
        unknown: '未知',
        article: '文章',
        image: '图片',
        video: '视频',
        images: '图片',
        videos: '视频',
        cleanResource: '无水印资源',
        cleanVideo: '无水印视频',
        extraLinks: '附加链接',
        cover: '封面',
        preview: '直播 / 预览链接',
        unnamed: '未命名内容',
        noWechatData: '公众号接口没有返回可用数据。',
        noData: '接口没有返回可用数据。',
        needInput: '请先粘贴分享口令或链接。',
        needSupported: '未识别到支持的平台。当前仅支持公众号、抖音、小红书链接。',
        clipboardEmpty: '剪贴板里没有可读取的文本内容。',
        clipboardRead: '已读取剪贴板内容。',
        clipboardFailed: '读取剪贴板失败，请手动粘贴。',
        noLinks: '当前结果里没有可复制的资源链接。',
        success: (count: number) => `解析成功，已获取 ${count} 条资源。`,
        copyOne: '复制',
        open: '打开',
        copied: '已复制',
        requestFailed: (name: string, status: number) => `${name} 接口请求失败（HTTP ${status}）。`,
        statNames: { likes: '点赞', saves: '收藏', comments: '评论', shares: '分享' },
      };
}

function normalizeResult(locale: 'zh-CN' | 'en', platform: Exclude<Platform, 'unknown'>, payload: any): UnifiedResult {
  const t = labels(locale);

  if (platform === 'wechat') {
    const wrapper = payload?.data || {};
    const data = wrapper.data;
    if (!data) throw new Error(wrapper.message || t.noWechatData);

    return {
      platform,
      platformName: t.platformName.wechat,
      title: data.title || t.unnamed,
      summary: data.desc || data.contentText || '',
      sourceUrl: data.url || '',
      type: data.type || t.article,
      authorName: data.author || '',
      accountName: data.accountName || '',
      publishTime: data.publishTime || '',
      tags: [],
      stats: [],
      resources: [
        {
          label: t.images,
          items: (data.downloadUrls || []).map((url: string, index: number) => ({
            title: `${t.image} ${index + 1}`,
            url,
            extra: data.coverImage && index === 0 ? `${t.cover}: ${data.coverImage}` : '',
          })),
        },
        {
          label: t.videos,
          items: (data.liveUrls || [])
            .map((url: string, index: number) => ({ url, index }))
            .filter((item: { url: string }) => item.url)
            .map((item: { url: string; index: number }) => ({ title: `${t.video} ${item.index + 1}`, url: item.url })),
        },
      ].filter((group) => group.items.length > 0),
    };
  }

  const wrapper = payload?.data || {};
  const detail = wrapper.data;
  if (!detail) throw new Error(wrapper.message || t.noData);

  const stats = [
    makeStat(t.statNames.likes, detail.likedCount),
    makeStat(t.statNames.saves, detail.collectedCount),
    makeStat(t.statNames.comments, detail.commentCount),
    makeStat(t.statNames.shares, detail.shareCount),
  ].filter(Boolean) as { label: string; value: number }[];

  const isVideo = detail.type && String(detail.type).includes('视频');
  const primaryLabel = isVideo ? t.cleanVideo : t.cleanResource;
  const liveItems = (detail.liveUrls || [])
    .map((url: string, index: number) => ({ url, index }))
    .filter((item: { url: string }) => item.url)
    .map((item: { url: string; index: number }) => ({
      title: `${t.preview} ${item.index + 1}`,
      url: item.url,
    }));

  return {
    platform,
    platformName: platform === 'douyin' ? t.platformName.douyin : t.platformName.xhs,
    title: detail.title || detail.desc || t.unnamed,
    summary: detail.desc || '',
    sourceUrl: detail.url || '',
    type: detail.type || '',
    authorName: detail.authorName || '',
    accountName: detail.authorId || '',
    publishTime: '',
    tags: Array.isArray(detail.tags) ? detail.tags : [],
    stats,
    resources: [
      {
        label: primaryLabel,
        items: (detail.downloadUrls || []).map((url: string, index: number) => ({
          title: `${primaryLabel} ${index + 1}`,
          url,
        })),
      },
      { label: t.extraLinks, items: liveItems },
    ].filter((group) => group.items.length > 0),
  };
}

export default function DewatermarkClient() {
  const { locale } = useI18n();
  const t = labels(locale);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<UnifiedResult | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const { copy } = useCopyToClipboard();

  const platform = useMemo(() => detectPlatform(input), [input]);
  const trimmed = input.trim();
  const platformName = t.platformName[platform];

  async function handleParse() {
    const value = input.trim();
    if (!value) {
      setError(t.needInput);
      return;
    }
    const detected = detectPlatform(value);
    if (detected === 'unknown') {
      setError(t.needSupported);
      return;
    }

    triggerHaptic(HapticFeedback.Medium);
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dewatermark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-locale': locale },
        body: JSON.stringify({ platform: detected, url: value }),
      });
      const data = await response.json();

      if (!response.ok || data?.code !== 0) {
        throw new Error(data?.error || data?.msg || t.requestFailed(t.platformName[detected], response.status));
      }

      const unified = normalizeResult(locale, detected, data);
      setResult(unified);
      setRaw(data);
      toast.success(t.success(countResources(unified.resources)));
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
        setError(t.clipboardEmpty);
        return;
      }
      setInput(text);
      setError('');
      toast.success(t.clipboardRead);
    } catch {
      setError(t.clipboardFailed);
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
      setError(t.noLinks);
      return;
    }
    await copy(urls.join('\n'));
  }

  const metaItems = result
    ? [
        { label: t.platform, value: result.platformName },
        { label: t.contentTitle, value: result.title },
        { label: t.type, value: result.type || t.unknown },
        { label: t.author, value: [result.authorName, result.accountName].filter(Boolean).join(' / ') || t.none },
        { label: t.publishTime, value: result.publishTime || t.none },
        { label: t.tags, value: result.tags.length ? result.tags.join(' / ') : t.none },
        {
          label: t.stats,
          value: result.stats.length ? result.stats.map((item) => `${item.label} ${item.value}`).join(' / ') : t.none,
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
            {t.title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#66568f] sm:text-base dark:text-[#c4b6eb]">
            {t.subtitle}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['wechat', 'douyin', 'xhs'] as const).map((key) => (
              <span key={key} className="rounded-full border border-[#d9ccff] bg-white/70 px-3 py-1 text-xs text-[#6b5b97] dark:border-[#3a2f58] dark:bg-white/[0.05] dark:text-[#c7baf1]">
                {t.platformName[key]}
              </span>
            ))}
          </div>
        </div>
      </header>

      <section className={cn(cardClass, 'mt-6')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#312355] dark:text-[#f4efff]">{t.inputTitle}</h2>
            <p className="mt-1 text-sm text-[#7b69a5] dark:text-[#af9fda]">{t.inputHint}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePaste} className="gap-1.5">
              <ClipboardPaste className="h-4 w-4" />
              {t.paste}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5">
              <Eraser className="h-4 w-4" />
              {t.clear}
            </Button>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          placeholder={t.placeholder}
          className="mt-4 w-full resize-y rounded-2xl border border-[#ddd0ff] bg-white/80 px-4 py-3 text-sm text-[#312355] outline-none transition placeholder:text-[#a99cce] focus:border-[#8b6bff] focus:ring-2 focus:ring-[#8b6bff]/30 dark:border-[#352b53] dark:bg-white/[0.04] dark:text-[#efe9ff] dark:placeholder:text-[#7c6ca6]"
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', platformStyle[trimmed ? platform : 'unknown'])}>
            {!trimmed ? t.notEntered : platform === 'unknown' ? t.unsupported : t.ready(platformName)}
          </span>
          <Button onClick={handleParse} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? t.parsing : t.parse}
          </Button>
        </div>

        {error && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">{error}</p>}
      </section>

      {result && (
        <section className={cn(cardClass, 'mt-6')}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#312355] dark:text-[#f4efff]">{t.resultTitle}</h2>
            <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-1.5">
              <Copy className="h-4 w-4" />
              {t.copyAll}
            </Button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {metaItems.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#eadfff] bg-white/60 px-4 py-3 text-sm dark:border-[#33274f] dark:bg-white/[0.03]">
                <div className="text-xs uppercase tracking-[0.18em] text-[#8c7bb9] dark:text-[#aa9bd4]">{item.label}</div>
                <div className="mt-1 break-words text-[#312355] dark:text-[#efe9ff]">{item.value}</div>
              </div>
            ))}
          </div>

          {result.summary && <p className="mt-5 rounded-2xl bg-[#f7f1ff] px-4 py-3 text-sm leading-7 text-[#6b5b97] dark:bg-white/[0.04] dark:text-[#c8bbef]">{result.summary}</p>}

          <div className="mt-6 space-y-5">
            <h3 className="text-sm font-semibold text-[#312355] dark:text-[#f4efff]">{t.resources}</h3>
            {result.resources.map((group) => (
              <div key={group.label} className="rounded-2xl border border-[#eadfff] bg-white/55 p-4 dark:border-[#33274f] dark:bg-white/[0.03]">
                <div className="mb-3 flex items-center justify-between gap-3 text-sm font-medium text-[#312355] dark:text-[#efe9ff]">
                  <span>{group.label}</span>
                  <span className="text-xs text-[#8c7bb9] dark:text-[#aa9bd4]">{group.items.length}</span>
                </div>
                <div className="space-y-3">
                  {group.items.map((item, index) => (
                    <div key={`${item.url}-${index}`} className="rounded-xl bg-[#fbf9ff] p-3 text-sm dark:bg-black/20">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[#312355] dark:text-[#efe9ff]">{item.title}</div>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-xs text-[#5b3df5] dark:text-[#bcaaff]">
                            {item.url}
                          </a>
                          {item.extra && <div className="mt-1 break-all text-xs text-[#8c7bb9] dark:text-[#aa9bd4]">{item.extra}</div>}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button variant="outline" size="sm" onClick={() => copy(item.url)} className="gap-1.5">
                            <Copy className="h-3.5 w-3.5" />
                            {t.copyOne}
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="gap-1.5">
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              {t.open}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {raw ? (
            <details className="mt-6 rounded-2xl border border-[#eadfff] bg-white/50 p-4 dark:border-[#33274f] dark:bg-white/[0.03]">
              <summary className="cursor-pointer text-sm font-medium text-[#312355] dark:text-[#efe9ff]">{t.raw}</summary>
              <p className="mt-2 text-xs text-[#8c7bb9] dark:text-[#aa9bd4]">{t.rawHint}</p>
              <pre className="mt-3 max-h-80 overflow-auto rounded-xl bg-black/90 p-4 text-xs text-white">
                {JSON.stringify(raw, null, 2)}
              </pre>
            </details>
          ) : null}
        </section>
      )}
    </div>
  );
}
