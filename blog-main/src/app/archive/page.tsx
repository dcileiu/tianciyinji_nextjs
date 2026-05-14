import type { Metadata } from 'next';
import ArchiveClientPage from '@/components/ArchiveClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata } from '@/lib/seo';
import { getAllBlogPosts } from '@/utils/posts';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('归档'),
  description: '按时间整理的博客文章与更新记录。',
  path: '/archive',
  keywords: ['文章归档', '博客归档', '时间线'],
});

export const revalidate = 60;

export default async function ArchivePage() {
  const posts = await getAllBlogPosts();

  return <ArchiveClientPage posts={posts} />;
}
