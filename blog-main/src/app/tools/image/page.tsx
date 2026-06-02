import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('图片处理工具：格式转换、裁剪改尺寸、加水印、主色提取、Favicon、二维码、压缩');

const description =
  '在线图片处理工具：图片格式转换（PNG/JPG/WebP）、裁剪与改尺寸、文字水印、主色调提取、Favicon 网站图标生成、二维码生成、图片与 Base64 互转、SVG 转图片、图片压缩与摸头 GIF，处理过程在浏览器本地完成，无需上传到第三方。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/image',
  keywords: [
    '图片格式转换',
    'PNG 转 JPG',
    'WebP 转换',
    '图片裁剪',
    '图片改尺寸',
    '图片加水印',
    '图片取色',
    '主色调提取',
    'Favicon 生成器',
    '二维码生成',
    '图片压缩',
  ],
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
