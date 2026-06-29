import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = (
  process.env.DEWATERMARK_BACKEND_URL || 'https://wallpaper.api.itianci.cn'
).replace(/\/+$/, '');

const EXTRACT_ENDPOINT = '/api/v1/open/media/extract';

type MediaImage = { url?: string; alt?: string };
type MediaVideo = {
  url?: string;
  poster?: string;
  source?: string;
  referer?: string;
  audio_url?: string;
};

type ExtractData = {
  url?: string;
  platform?: string;
  platform_name?: string;
  title?: string;
  summary?: string;
  cover_image?: string;
  images?: MediaImage[];
  videos?: MediaVideo[];
};

export type MediaItem = {
  type: 'image' | 'video';
  url: string;
  downloadUrl: string;
  filename: string;
  poster?: string;
  label?: string;
  source?: string;
};

function buildMediaAssetProxyUrl(mediaUrl: string, referer?: string) {
  const params = new URLSearchParams({ url: mediaUrl });
  if (referer) params.set('referer', referer);
  return `${BACKEND_BASE_URL}/api/v1/open/media/asset?${params.toString()}`;
}

/** 代理接口仅支持 https，自动升级 http；非 http(s) 资源原样返回 */
function toProxy(rawUrl: string, referer?: string) {
  if (!/^https?:\/\//i.test(rawUrl)) return rawUrl;
  const httpsUrl = rawUrl.replace(/^http:\/\//i, 'https://');
  return buildMediaAssetProxyUrl(httpsUrl, referer);
}

function guessExt(url: string, type: 'image' | 'video') {
  const clean = url.split(/[?#]/)[0].toLowerCase();
  const match = clean.match(/\.(mp4|webm|mov|m4v|m4s|jpg|jpeg|png|webp|gif|heic|avif)$/);
  if (match) return match[1] === 'jpeg' ? 'jpg' : match[1];
  return type === 'video' ? 'mp4' : 'jpg';
}

function sanitizeName(name: string) {
  return (
    name
      .replace(/[\\/:*?"<>|\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 50) || '媒体文件'
  );
}

function buildMediaItems(data: ExtractData): MediaItem[] {
  const items: MediaItem[] = [];
  const pageReferer = data.url || '';
  const baseName = sanitizeName(
    data.title || data.summary || data.platform_name || '媒体文件',
  );
  const videoPosters = new Set(
    (data.videos ?? []).map((v) => v.poster).filter((url): url is string => Boolean(url)),
  );

  let videoIndex = 0;
  let imageIndex = 0;

  for (const video of data.videos ?? []) {
    if (!video.url) continue;
    videoIndex += 1;
    const referer = video.referer || pageReferer;
    const playUrl = toProxy(video.url, referer);
    const ext = guessExt(video.url, 'video');

    items.push({
      type: 'video',
      url: playUrl,
      downloadUrl: playUrl,
      filename: `${baseName}-视频${videoIndex}.${ext}`,
      poster: video.poster ? toProxy(video.poster, referer) : undefined,
      source: video.source,
      label:
        video.source === 'bilibili-dash-video'
          ? '视频分片（无音轨，需合并音频）'
          : undefined,
    });

    if (video.source === 'bilibili-dash-video' && video.audio_url) {
      items.push({
        type: 'video',
        url: toProxy(video.audio_url, referer),
        downloadUrl: toProxy(video.audio_url, referer),
        filename: `${baseName}-音频${videoIndex}.m4s`,
        label: '音频分片（DASH，需与视频合并）',
        source: video.source,
      });
    }
  }

  for (const image of data.images ?? []) {
    if (!image.url) continue;
    if (videoPosters.has(image.url) && (data.videos?.length ?? 0) > 0) continue;
    imageIndex += 1;
    const proxied = toProxy(image.url, pageReferer);

    items.push({
      type: 'image',
      url: proxied,
      downloadUrl: proxied,
      filename: `${baseName}-图片${imageIndex}.${guessExt(image.url, 'image')}`,
      label: image.alt || undefined,
    });
  }

  return items;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body || {};

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ code: 1, error: '缺少有效的分享链接或口令。' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const target = `${BACKEND_BASE_URL}${EXTRACT_ENDPOINT}`;
    const headers: Record<string, string> = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json; charset=utf-8',
    };

    const apiKey = process.env.DEWATERMARK_API_KEY?.trim();
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(target, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        input: trimmedUrl,
        imageFormat: 'jpeg',
        videoPreference: 'resolution',
      }),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload?.msg || payload?.error || `请求解析服务失败 (HTTP ${response.status})`;
      return NextResponse.json({ code: payload?.code ?? 1, error: message }, { status: response.status });
    }

    if (!payload || payload.code !== 0 || !payload.data) {
      return NextResponse.json(
        { code: payload?.code ?? 1, error: payload?.msg || '解析接口未返回有效数据。' },
        { status: 400 },
      );
    }

    const data = payload.data as ExtractData;
    const items = buildMediaItems(data);

    if (!items.length) {
      return NextResponse.json({ code: 1, error: payload?.msg || '解析接口未返回有效资源。' }, { status: 400 });
    }

    return NextResponse.json({
      code: 0,
      data: {
        platform: data.platform,
        platformName: data.platform_name,
        title: data.title || data.summary || '解析内容',
        items,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { code: 1, error: error instanceof Error ? error.message : '解析过程出现未知错误' },
      { status: 500 },
    );
  }
}
