import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, url } = body || {};

    // 简单模拟解析逻辑：根据 url 返回若干 downloadUrls / liveUrls
    const downloadUrls = [] as string[];
    const liveUrls = [] as string[];

    // 示例：如果 URL 中含有 'video' 返回视频下载；含 'live' 返回 live URL
    if (typeof url === 'string') {
      if (url.includes('video')) {
        downloadUrls.push(`https://cdn.example.com/${platform}/video-12345.mp4`);
      } else {
        downloadUrls.push(`https://cdn.example.com/${platform}/image-12345.jpg`);
      }
      if (url.includes('live')) {
        liveUrls.push(`https://live.example.com/${platform}/room-999`);
      }
    }

    const data = {
      platform,
      title: '示例内容标题',
      downloadUrls,
      liveUrls,
    };

    return NextResponse.json({ code: 0, data });
  } catch {
    return NextResponse.json({ code: 1, error: 'invalid request' }, { status: 400 });
  }
}
