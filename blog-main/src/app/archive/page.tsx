import type { Metadata } from 'next';
import ArchiveClientPage from '@/components/ArchiveClientPage';
import { getDictionary } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n-server';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';
import { getAllBlogPosts } from '@/utils/posts';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = getDictionary(locale).archive;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: '/archive',
    keywords: [...text.metadataKeywords],
    locale,
  });
}

export const revalidate = 60;

export default async function ArchivePage() {
  const posts = await getAllBlogPosts();

  return <ArchiveClientPage posts={posts} />;
}
