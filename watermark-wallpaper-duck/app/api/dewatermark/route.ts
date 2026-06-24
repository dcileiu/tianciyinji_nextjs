import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = (process.env.DEWATERMARK_BACKEND_URL || 'https://wallpaper.api.itianci.cn').replace(
  /\/+$/,
  ''
);

const PLATFORM_ENDPOINT = {
  wechat: '/api/v1/wechat/detail',
  douyin: '/api/v1/douyin/detail',
  xhs: '/api/v1/xhs/detail',
  kuaishou: '/api/v1/kuaishou/detail',
} as const;

type SupportedPlatform = keyof typeof PLATFORM_ENDPOINT;

function detectPlatform(url: string): SupportedPlatform | 'unknown' {
  const text = String(url || '');
  if (/mp\.weixin\.qq\.com\/s\//i.test(text)) return 'wechat';
  if (/xhslink\.com\/|xiaohongshu\.com\//i.test(text)) return 'xhs';
  if (/v\.douyin\.com\/|(?:www\.)?douyin\.com\/|(?:www\.)?iesdouyin\.com\//i.test(text)) return 'douyin';
  if (/v\.kuaishou\.com\/|(?:[\w-]+\.)?kuaishou\.com\/|(?:[\w-]+\.)?gifshow\.com\//i.test(text)) {
    return 'kuaishou';
  }
  return 'unknown';
}

function buildRequestBody(platform: SupportedPlatform, url: string) {
  if (platform === 'wechat') return { url };
  if (platform === 'xhs') {
    return {
      url,
      imageFormat: 'jpeg',
      videoPreference: 'resolution',
    };
  }
  return { url, videoPreference: 'resolution' };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body || {};

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ code: 1, error: '缺少有效的分享链接或口令。' }, { status: 400 });
    }

    const trimmedUrl = url.trim();
    const platform = detectPlatform(trimmedUrl);

    if (platform === 'unknown') {
      return NextResponse.json({ code: 1, error: '未识别到支持的平台，目前仅支持公众号、抖音、小红书、快手。' }, { status: 400 });
    }

    const endpoint = PLATFORM_ENDPOINT[platform];
    const target = `${BACKEND_BASE_URL}${endpoint}`;

    const response = await fetch(target, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(buildRequestBody(platform, trimmedUrl)),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ code: 1, error: `请求解析服务失败 (HTTP ${response.status})` }, { status: response.status });
    }

    const payload = await response.json();

    // 提取真正的资源列表
    const wrapper = payload?.data || {};
    const detail = wrapper.data || {};

    const downloadUrls = detail.downloadUrls || [];
    const liveUrls = detail.liveUrls || [];

    if (!downloadUrls.length && !liveUrls.length) {
      return NextResponse.json({ code: 1, error: wrapper.message || '解析接口未返回有效资源。' }, { status: 400 });
    }

    return NextResponse.json({
      code: 0,
      data: {
        platform,
        title: detail.title || detail.desc || '解析内容',
        downloadUrls,
        liveUrls,
      }
    });
  } catch (error) {
    return NextResponse.json({ code: 1, error: error instanceof Error ? error.message : '解析过程出现未知错误' }, { status: 500 });
  }
}

