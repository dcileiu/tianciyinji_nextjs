import type { Metadata } from 'next';
import SearchPageClient from '@/components/SearchPageClient';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('搜索'),
  description: '站内文章搜索页。',
  path: '/search',
  keywords: ['站内搜索'],
  noIndex: true,
});

export default function SearchPage() {
  return <SearchPageClient />;
}

