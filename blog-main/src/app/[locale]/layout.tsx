import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import { LayoutClient } from '@/components/LayoutClient';
import { getDictionary, getLocalizedSiteConfig, locales, normalizeLocale } from '@/lib/i18n';

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
  const localizedSiteConfig = getLocalizedSiteConfig(locale);

  return (
    <LayoutClient
      dictionary={dictionary}
      locale={locale}
      footer={<Footer siteName={localizedSiteConfig.name} tagline={localizedSiteConfig.tagline} />}
    >
      {children}
    </LayoutClient>
  );
}
