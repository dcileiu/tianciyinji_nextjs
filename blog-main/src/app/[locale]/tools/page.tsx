import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsHub from '@/components/ToolsHub';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = getDictionary(locale).toolsHub;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/tools',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const text = getDictionary(locale).toolsHub;
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: pageTitle(text.metadataTitle),
          description: text.metadataDescription,
          path: '/tools',
          locale,
        })}
      />
      <ToolsHub locale={locale} />
    </>
  );
}
