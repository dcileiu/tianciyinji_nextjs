import { NextResponse } from 'next/server';

function getLocale(request: Request) {
  const headerLocale = request.headers.get('x-locale');
  const cookieLocale = request.headers.get('cookie')?.match(/(?:^|;\s*)locale=([^;]+)/)?.[1];
  return headerLocale === 'en' || cookieLocale === 'en' ? 'en' : 'zh';
}

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  const locale = getLocale(request);

  if (!clientId || !callbackUrl) {
    return NextResponse.json({ error: locale === 'en' ? 'GitHub OAuth configuration is missing' : 'GitHub OAuth 配置缺失' }, { status: 500 });
  }

  // 重定向到 GitHub OAuth 授权页面
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=user:email,repo`;

  return NextResponse.redirect(githubAuthUrl);
}
