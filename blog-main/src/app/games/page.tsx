import type { Metadata } from 'next';
import GamesPageClient from '@/components/GamesPageClient';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).media.games;

  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/games',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default function GamesPage() {
  return <GamesPageClient />;
}
