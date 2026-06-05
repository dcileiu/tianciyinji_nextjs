import type { Metadata } from 'next';
import SearchPageClient from '@/components/SearchPageClient';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).search;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/search',
    keywords: [...text.metadataKeywords],
    noIndex: true,
    locale,
  });
}

export default function SearchPage() {
  return <SearchPageClient />;
}
