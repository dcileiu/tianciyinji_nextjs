import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 去水印后端地址（用户自有服务）。可通过环境变量覆盖。
const BACKEND_BASE_URL = (
  process.env.DEWATERMARK_BACKEND_URL || 'https://wallpaper.api.itianci.cn'
).replace(/\/+$/, '');

const DEFAULT_VIDEO_PREFERENCE = 'resolution';
const DEFAULT_XHS_IMAGE_FORMAT = 'jpeg';

type Platform = 'wechat' | 'douyin' | 'xhs';

const PLATFORM_ENDPOINT: Record<Platform, string> = {
  wechat: '/api/v1/wechat/detail',
  douyin: '/api/v1/douyin/detail',
  xhs: '/api/v1/xhs/detail',
};

function buildBody(platform: Platform, url: string) {
  if (platform === 'wechat') {
    return { url };
  }
  if (platform === 'douyin') {
    return { url, videoPreference: DEFAULT_VIDEO_PREFERENCE };
  }
  // xhs
  return {
    url,
    imageFormat: DEFAULT_XHS_IMAGE_FORMAT,
    videoPreference: DEFAULT_VIDEO_PREFERENCE,
  };
}

export async function POST(request: Request) {
  let payload: { platform?: string; url?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: '请求体必须是合法的 JSON。' }, { status: 400 });
  }

  const platform = payload.platform as Platform | undefined;
  const url = typeof payload.url === 'string' ? payload.url.trim() : '';

  if (!platform || !(platform in PLATFORM_ENDPOINT)) {
    return NextResponse.json(
      { error: '未识别到支持的平台，仅支持公众号、抖音、小红书。' },
      { status: 400 }
    );
  }
  if (!url) {
    return NextResponse.json({ error: '缺少分享链接或口令。' }, { status: 400 });
  }

  const target = `${BACKEND_BASE_URL}${PLATFORM_ENDPOINT[platform]}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(buildBody(platform, url)),
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { error: `接口返回了非 JSON 内容（HTTP ${upstream.status}）。` },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isAbort ? '请求超时，请稍后重试。' : '请求去水印接口失败，请稍后重试。' },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
