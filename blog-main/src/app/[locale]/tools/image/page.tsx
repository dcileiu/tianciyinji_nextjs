import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { normalizeLocale } from '@/lib/i18n';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '图片处理工具：格式转换、裁剪改尺寸、加水印、主色提取、Favicon、二维码、压缩',
    description:
      '在线图片处理工具：图片格式转换（PNG/JPG/WebP）、裁剪与改尺寸、文字水印、主色调提取、Favicon 网站图标生成、二维码生成、图片与 Base64 互转、SVG 转图片、图片压缩与摸头 GIF，处理过程在浏览器本地完成，无需上传到第三方。',
    keywords: ['图片格式转换', 'PNG 转 JPG', 'WebP 转换', '图片裁剪', '图片加水印', '主色调提取', 'Favicon 生成器', '二维码生成', '图片压缩'],
  },
  en: {
    title: 'Image Tools: Convert, Crop, Resize, Watermark, Favicon, QR Code, Compress',
    description:
      'Online image tools for format conversion, cropping, resizing, text watermarks, dominant color extraction, favicon generation, QR codes, image/Base64 conversion, SVG export, compression, and pet GIF generation. Most processing runs locally in the browser.',
    keywords: ['image converter', 'PNG to JPG', 'WebP converter', 'image crop', 'image resize', 'watermark', 'favicon generator', 'QR code generator', 'image compression'],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/image', keywords: [...text.keywords], locale });
}

export default async function ImageToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/image', locale })} />
      <ToolsClientPage section="image-tools" />
    </>
  );
}
