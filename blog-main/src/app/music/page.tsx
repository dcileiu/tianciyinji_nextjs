import type { Metadata } from 'next';
import MusicPageClient from '@/components/MusicPageClient';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).media.music;

  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/music',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export default function MusicPage() {
  return <MusicPageClient />;
}
