import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { LOCALE_COOKIE, normalizeLocale } from './i18n';

export async function getLocale() {
  const headersList = await headers();
  const headerLocale = normalizeLocale(headersList.get('x-locale'));
  if (headerLocale === 'en') return headerLocale;

  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
