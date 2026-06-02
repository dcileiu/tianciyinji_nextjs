import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('前端 / CSS 工具：渐变生成、box-shadow、圆角、调色板');

const description =
  '面向前端与设计的可视化在线工具：CSS 渐变生成器（线性/径向）、box-shadow 阴影生成、border-radius 圆角生成与调色板生成，所见即所得并一键复制 CSS 代码。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/css',
  keywords: ['CSS 渐变生成器', 'box-shadow 生成', 'border-radius 生成', '圆角生成', '调色板生成', 'CSS 工具'],
});

export default async function CssToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/css' })} />
      <ToolsClientPage section="css-tools" initialTool={tool} />
    </>
  );
}
