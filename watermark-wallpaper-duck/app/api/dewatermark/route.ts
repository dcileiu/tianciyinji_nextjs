import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = (process.env.DEWATERMARK_BACKEND_URL || 'https://wallpaper.itianci.cn').replace(
  /\/+$/,
  '',
);

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
  platform?: string;
  platform_name?: string;
  title?: string;
  summary?: string;
  cover_image?: string;
  images?: MediaImage[];
  videos?: MediaVideo[];
};

function collectMediaUrls(data: ExtractData) {
  const images = (data.images ?? []).map((item) => item.url).filter((url): url is string => Boolean(url));
  const videos = (data.videos ?? []).map((item) => item.url).filter((url): url is string => Boolean(url));
  const downloadUrls = [...new Set([...images, ...videos])];
  const dashTracks = (data.videos ?? [])
    .filter((item) => item.source === 'bilibili-dash-video' && item.audio_url)
    .map((item) => item.audio_url as string);

  return {
    downloadUrls,
    liveUrls: [...new Set(dashTracks)],
  };
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
    const { downloadUrls, liveUrls } = collectMediaUrls(data);

    if (!downloadUrls.length && !liveUrls.length) {
      return NextResponse.json({ code: 1, error: payload?.msg || '解析接口未返回有效资源。' }, { status: 400 });
    }

    return NextResponse.json({
      code: 0,
      data: {
        platform: data.platform,
        platformName: data.platform_name,
        title: data.title || data.summary || '解析内容',
        downloadUrls,
        liveUrls,
        videos: data.videos,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { code: 1, error: error instanceof Error ? error.message : '解析过程出现未知错误' },
      { status: 500 },
    );
  }
}
