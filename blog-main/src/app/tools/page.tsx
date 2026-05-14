import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: pageTitle('工具'),
  description: '集合纯本地工具、图片处理、网络基础能力和公开数据接口的小工具菜单。',
  path: '/tools',
  keywords: ['在线工具', '图片处理', '网络工具', '开发者工具'],
});

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: pageTitle('工具'),
          description: '集合纯本地工具、图片处理、网络基础能力和公开数据接口的小工具菜单。',
          path: '/tools',
        })}
      />
      <ToolsClientPage />
    </>
  );
}
