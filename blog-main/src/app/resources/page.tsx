import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ResourcesClient from '@/components/ResourcesClient';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { getResources } from '@/utils/resources';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).resources;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/resources',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default async function ResourcesPage() {
  const locale = await getLocale();
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
        })}
      />
      <ResourcesClient locale={locale} resources={resources} text={text} />
    </>
  );
}
