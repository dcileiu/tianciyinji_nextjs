import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 开发环境禁用 SSL 验证（生产环境不应这样做）
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// 硬编码音乐配置
const MUSIC_CONFIG = {
  playlistId: '8308939217',
  neteaseBaseUrl: 'https://music-api.sdjz.wiki',
  wyapiBaseUrl: 'https://wyapi-1.toubiec.cn',
  isEnabled: true,
};

function getLocale(request: NextRequest) {
  const headerLocale = request.headers.get('x-locale');
  const cookieLocale = request.headers.get('cookie')?.match(/(?:^|;\s*)locale=([^;]+)/)?.[1];
  return headerLocale === 'en' || cookieLocale === 'en' ? 'en' : 'zh';
}

/**
 * GET - 获取歌曲详情
 */
export async function GET(request: NextRequest) {
  try {
    const locale = getLocale(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: locale === 'en' ? 'Song ID is required' : '歌曲 ID 不能为空' }, { status: 400 });
    }

    if (!MUSIC_CONFIG.isEnabled) {
      return NextResponse.json({ error: locale === 'en' ? 'Music feature is not enabled' : '音乐功能未启用' }, { status: 404 });
    }

    // 请求详情 API
    const url = `${MUSIC_CONFIG.wyapiBaseUrl}/api/music/detail`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200) {
      return NextResponse.json({ error: locale === 'en' ? 'Failed to fetch song details' : '获取歌曲详情失败' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      detail: data.data,
    });
  } catch (error) {
    console.error('[!] 获取歌曲详情失败:', error);
    const locale = getLocale(request);
    return NextResponse.json({ error: locale === 'en' ? 'Request failed. Please try again later' : '获取失败，请稍后重试' }, { status: 500 });
  }
}
