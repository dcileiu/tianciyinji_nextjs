import type { Metadata } from 'next';
import ArchiveClientPage from '@/components/ArchiveClientPage';
import { getDictionary, normalizeLocale } from '@/lib/i18n';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';
import { getAllBlogPosts } from '@/utils/posts';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
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
