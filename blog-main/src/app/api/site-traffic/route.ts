import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = 'https://data.similarweb.com/api/v1/data';

function normalizeDomain(raw: string) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/^www\./i, '')
    .toLowerCase();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = normalizeDomain(searchParams.get('domain') || '');

  if (!domain) {
    return NextResponse.json({ error: '请输入要查询的域名。' }, { status: 400 });
  }
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) {
    return NextResponse.json({ error: '域名格式不正确，例如 example.com。' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const upstream = await fetch(`${BASE}?domain=${encodeURIComponent(domain)}`, {
      headers: {
        Accept: 'application/json, text/plain, */*',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    const text = await upstream.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      return NextResponse.json(
        { error: '数据源返回异常，请稍后再试。' },
        { status: 502 },
      );
    }

    // SimilarWeb 对于无数据的域名会返回空对象或缺少核心字段
    if (!data || (!data.GlobalRank && !data.Engagments && !data.EstimatedMonthlyVisits)) {
      return NextResponse.json(
        { error: '未查询到该域名的流量数据（可能流量太小或暂未收录）。' },
        { status: 404 },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: isAbort ? '请求超时，请稍后重试。' : '请求流量数据失败，请稍后重试。' },
      { status: 504 },
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
