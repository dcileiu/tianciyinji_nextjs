import { NextResponse } from 'next/server';
import { runServerTool } from '@/lib/tools/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isEnglish(request: Request) {
  const headerLocale = request.headers.get('x-locale');
  const cookieLocale = request.headers.get('cookie')?.match(/NEXT_LOCALE=([^;]+)/)?.[1];
  return headerLocale === 'en' || cookieLocale === 'en';
}

export async function POST(request: Request) {
  const en = isEnglish(request);
  try {
    const body = (await request.json()) as { tool?: string; payload?: Record<string, unknown> };
    if (!body?.tool) {
      return NextResponse.json(
        { ok: false, error: en ? 'The tool parameter is required.' : 'tool 参数不能为空。' },
        { status: 400 }
      );
    }

    const data = await runServerTool(body.tool, body.payload, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : en ? 'Tool execution failed.' : '工具执行失败。';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
