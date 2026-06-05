import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, getPathLocale, LOCALE_COOKIE } from '@/lib/i18n';

// 这些根级路由不在 [locale] 段下，禁止被重写到内部 locale 段
const RESERVED_ROOT_PATHS = ['/rss', '/opengraph-image', '/twitter-image'];

function isReservedRoot(pathname: string) {
  return RESERVED_ROOT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 内部前缀 /zh-CN/* 不应对外暴露，重定向到无前缀的规范 URL，避免重复内容
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || '/';
    return NextResponse.redirect(url);
  }

  const locale = getPathLocale(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  // 默认语言（无前缀）重写到内部 [locale]=zh-CN 段；英文 /en/* 已天然匹配 [locale]=en，无需重写
  if (locale === defaultLocale && !isReservedRoot(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return setLocaleCookie(NextResponse.rewrite(url, { request: { headers: requestHeaders } }), locale);
  }

  return setLocaleCookie(NextResponse.next({ request: { headers: requestHeaders } }), locale);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
