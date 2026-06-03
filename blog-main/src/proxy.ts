import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, getPathLocale, LOCALE_COOKIE, stripLocalePrefix } from '@/lib/i18n';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getPathLocale(pathname);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  if (locale === defaultLocale) {
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.cookies.set(LOCALE_COOKIE, defaultLocale, { path: '/', sameSite: 'lax', maxAge: 31536000 });
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = stripLocalePrefix(pathname);
  const response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 31536000 });
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
