import type { Metadata } from 'next';
import DewatermarkClient from '@/components/DewatermarkClient';
import JsonLd from '@/components/JsonLd';
import { pageTitle } from '@/lib/site-config';
import { buildPageMetadata, buildCollectionPageJsonLd } from '@/lib/seo';

const title = pageTitle('去水印工具：公众号 / 抖音 / 小红书无水印解析');

const description =
  '在线去水印工具，粘贴公众号文章、抖音、小红书的分享链接或口令，自动识别平台并返回无水印图片、视频与文章资源链接，支持一键复制。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/dewatermark',
  keywords: ['去水印', '抖音去水印', '小红书去水印', '公众号文章提取', '无水印下载', '在线工具'],
});

export default function DewatermarkPage() {
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title,
          description,
          path: '/tools/dewatermark',
        })}
      />
      <DewatermarkClient />
    </>
  );
}
