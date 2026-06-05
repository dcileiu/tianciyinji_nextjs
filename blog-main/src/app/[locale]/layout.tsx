import type { ReactNode } from 'react';
import { LayoutClient } from '@/components/LayoutClient';
import { getDictionary, locales, normalizeLocale } from '@/lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = normalizeLocale((await params).locale);
  const dictionary = getDictionary(locale);

  return (
    <LayoutClient dictionary={dictionary} locale={locale}>
      {children}
    </LayoutClient>
  );
}
