import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('中文工具：简繁体转换、汉字转拼音、中文假数据生成');

const description =
  '面向中文场景的在线工具：简体繁体互转（基于 OpenCC）、汉字转拼音（带声调/数字声调/首字母）、中文测试假数据生成（姓名、手机号、邮箱、地址），全部在浏览器本地完成。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/chinese',
  keywords: ['简繁转换', '繁体字转换', '汉字转拼音', '拼音转换', '中文假数据', '测试数据生成'],
});

export default async function ChineseToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/chinese' })} />
      <ToolsClientPage section="cn-tools" initialTool={tool} />
    </>
  );
}
