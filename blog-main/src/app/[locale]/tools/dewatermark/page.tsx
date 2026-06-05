import type { Metadata } from 'next';
import DewatermarkClient from '@/components/DewatermarkClient';
import JsonLd from '@/components/JsonLd';
import { normalizeLocale } from '@/lib/i18n';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '去水印工具：公众号 / 抖音 / 小红书无水印解析',
    description:
      '在线去水印工具，粘贴公众号文章、抖音、小红书的分享链接或口令，自动识别平台并返回无水印图片、视频与文章资源链接，支持一键复制。',
    keywords: ['去水印', '抖音去水印', '小红书去水印', '公众号文章提取', '无水印下载', '在线工具'],
  },
  en: {
    title: 'Dewatermark Tool: WeChat, Douyin, Xiaohongshu Clean Resource Parser',
    description:
      'An online dewatermark tool for WeChat Official Account articles, Douyin, and Xiaohongshu share links. It detects the platform and returns clean image, video, and article resources with one-click copy.',
    keywords: ['dewatermark', 'Douyin dewatermark', 'Xiaohongshu dewatermark', 'WeChat article extraction', 'clean download', 'online tool'],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/dewatermark', keywords: [...text.keywords], locale });
}

export default async function DewatermarkPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/dewatermark', locale })} />
      <DewatermarkClient />
    </>
  );
}
