import { NextResponse } from 'next/server';
import {
  buildDewatermarkRequestBody,
  DEWATERMARK_PLATFORM_ENDPOINT,
  isSupportedDewatermarkPlatform,
} from '@/lib/dewatermark';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BACKEND_BASE_URL = (process.env.DEWATERMARK_BACKEND_URL || 'https://wallpaper.api.itianci.cn').replace(
  /\/+$/,
  ''
);

function isEnglish(request: Request) {
  const headerLocale = request.headers.get('x-locale');
  const cookieLocale = request.headers.get('cookie')?.match(/NEXT_LOCALE=([^;]+)/)?.[1];
  return headerLocale === 'en' || cookieLocale === 'en';
}

export async function POST(request: Request) {
  const en = isEnglish(request);
  let payload: { platform?: string; url?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: en ? 'The request body must be valid JSON.' : '请求体必须是合法的 JSON。' },
      { status: 400 }
    );
  }

  const platform = payload.platform;
  const url = typeof payload.url === 'string' ? payload.url.trim() : '';

  if (!isSupportedDewatermarkPlatform(platform)) {
    return NextResponse.json(
      {
        error: en
          ? 'Unsupported platform. Only WeChat Official Account, Douyin, Xiaohongshu, and Kuaishou are supported.'
          : '未识别到支持的平台，仅支持公众号、抖音、小红书、快手。',
      },
      { status: 400 }
    );
  }
  if (!url) {
    return NextResponse.json(
      { error: en ? 'Missing share link or command text.' : '缺少分享链接或口令。' },
      { status: 400 }
    );
  }

  const target = `${BACKEND_BASE_URL}${DEWATERMARK_PLATFORM_ENDPOINT[platform]}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120_000);

  try {
    const upstream = await fetch(target, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(buildDewatermarkRequestBody(platform, url)),
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await upstream.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        {
          error: en
            ? `The upstream service returned non-JSON content (HTTP ${upstream.status}).`
            : `接口返回了非 JSON 内容（HTTP ${upstream.status}）。`,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      {
        error: en
          ? isAbort
            ? 'Request timed out. Please try again later.'
            : 'Failed to call the dewatermark service. Please try again later.'
          : isAbort
            ? '请求超时，请稍后重试。'
            : '请求去水印接口失败，请稍后重试。',
      },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
