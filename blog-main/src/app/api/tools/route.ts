import { NextResponse } from 'next/server';
import { runServerTool } from '@/lib/tools/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { tool?: string; payload?: Record<string, unknown> };
    if (!body?.tool) {
      return NextResponse.json({ ok: false, error: 'tool 参数不能为空。' }, { status: 400 });
    }

    const data = await runServerTool(body.tool, body.payload, request.headers);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : '工具执行失败。';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
