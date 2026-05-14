import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ResourcesClient from '@/components/ResourcesClient';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { getResources } from '@/utils/resources';

export const revalidate = 60;

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('资源'),
  description: '集中整理模板、清单和可以重复使用的内容。',
  path: '/resources',
  keywords: ['资源库', '模板', '清单', '下载'],
});

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: pageTitle('资源'),
          description: '集中整理模板、清单和可以重复使用的内容。',
          path: '/resources',
        })}
      />
      <ResourcesClient resources={resources} />
    </>
  );
}
