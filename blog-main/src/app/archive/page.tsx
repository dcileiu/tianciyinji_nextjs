import type { Metadata } from 'next';
import ArchiveClientPage from '@/components/ArchiveClientPage';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { getAllBlogPosts } from '@/utils/posts';

export const metadata: Metadata = {
  title: pageTitle('归档'),
  description: '按时间整理的博客文章与更新记录。',
  openGraph: {
    title: pageTitle('归档'),
    description: '按时间整理的博客文章与更新记录。',
    siteName: siteConfig.name,
  },
};

export const revalidate = 60;

export default async function ArchivePage() {
  const posts = await getAllBlogPosts();

  return <ArchiveClientPage posts={posts} />;
}
