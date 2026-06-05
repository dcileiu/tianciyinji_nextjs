import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ResourcesClient from '@/components/ResourcesClient';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { getResources } from '@/utils/resources';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = getDictionary(locale).resources;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/resources',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const dictionary = getDictionary(locale);
  const text = dictionary.resources;
  const resources = await getResources();

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: pageTitle('资源'),
          description: text.metadataDescription,
          path: '/resources',
          locale,
        })}
      />
      <ResourcesClient resources={resources} />
    </>
  );
}
