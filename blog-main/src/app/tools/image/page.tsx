import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('图片处理工具：二维码、Base64、SVG 转图片、图片压缩、摸头 GIF');

const description =
  '在线图片处理工具：二维码生成、图片与 Base64 互转、SVG 转图片、图片压缩（JPEG/WebP）以及摸头 GIF 生成，处理过程在浏览器本地完成，无需上传到第三方。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/image',
  keywords: ['二维码生成', '图片转 Base64', 'SVG 转图片', '图片压缩', '摸头 GIF'],
});

export default async function ImageToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/image' })} />
      <ToolsClientPage section="image-tools" initialTool={tool} />
    </>
  );
}
