import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { LayoutClient } from '@/components/LayoutClient';
import { getDictionary, getLocalizedSiteConfig, locales, normalizeLocale } from '@/lib/i18n';
import { siteConfig } from '@/lib/site-config';
import { buildPersonJsonLd, buildWebSiteJsonLd } from '@/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const localizedSiteConfig = getLocalizedSiteConfig(locale);

  return {
    applicationName: localizedSiteConfig.name,
    authors: [{ name: localizedSiteConfig.name, url: siteConfig.url }],
    creator: localizedSiteConfig.name,
    publisher: localizedSiteConfig.name,
    openGraph: {
      siteName: localizedSiteConfig.name,
      locale: locale === 'en' ? 'en_US' : 'zh_CN',
    },
  };
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
    <>
      <JsonLd data={[buildWebSiteJsonLd(locale), buildPersonJsonLd(locale)]} />
      <LayoutClient
        dictionary={dictionary}
        locale={locale}
        footer={<Footer siteName={localizedSiteConfig.name} tagline={localizedSiteConfig.tagline} />}
      >
        {children}
      </LayoutClient>
    </>
  );
}
