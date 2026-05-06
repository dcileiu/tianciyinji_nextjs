import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'disabled',
    service: 'Gitee webhook',
    message: 'This project is currently using local markdown content only.',
  });
}

export async function POST() {
  return NextResponse.json(
    {
      status: 'disabled',
      service: 'Gitee webhook',
      message: 'This project is currently using local markdown content only.',
    },
    { status: 410 }
  );
}
