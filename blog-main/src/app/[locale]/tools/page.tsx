import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsHub from '@/components/ToolsHub';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).toolsHub;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/tools',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function ToolsPage() {
  const locale = await getLocale();
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
