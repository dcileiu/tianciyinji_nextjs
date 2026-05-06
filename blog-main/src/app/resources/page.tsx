import type { Metadata } from 'next';
import ResourcesClient from '@/components/ResourcesClient';
import { pageTitle, siteConfig } from '@/lib/site-config';
import { getResources } from '@/utils/resources';

export const revalidate = 60;

export const metadata: Metadata = {
  title: pageTitle('资源'),
  description: '集中整理模板、清单和可以重复使用的内容。',
  openGraph: {
    title: pageTitle('资源'),
    description: '集中整理模板、清单和可以重复使用的内容。',
    siteName: siteConfig.name,
  },
};

export default async function ResourcesPage() {
  const resources = await getResources();

  return <ResourcesClient resources={resources} />;
}
