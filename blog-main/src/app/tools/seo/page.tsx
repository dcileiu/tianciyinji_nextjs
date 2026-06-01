import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('SEO | GEO 工具：llms.txt、Meta 标签、robots.txt、JSON-LD、关键词密度');

const description =
  '面向搜索引擎（SEO）与生成式 AI（GEO）的在线优化工具集合：llms.txt 生成器、Meta 标签 / TDK 生成、robots.txt 生成器、结构化数据 JSON-LD 生成与关键词密度分析，帮助网站更好地被搜索引擎和大模型理解与引用。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/seo',
  keywords: [
    'llms.txt 生成器',
    'Meta 标签生成',
    'TDK 生成',
    'robots.txt 生成器',
    '结构化数据',
    'JSON-LD',
    '关键词密度',
    'SEO 工具',
    'GEO 工具',
  ],
});

export default async function SeoToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/seo' })} />
      <ToolsClientPage section="seo-geo-tools" initialTool={tool} />
    </>
  );
}
