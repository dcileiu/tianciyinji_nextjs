import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { getLocale } from '@/lib/i18n-server';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '中文工具：简繁体转换、汉字转拼音、中文假数据生成',
    description:
      '面向中文场景的在线工具：简体繁体互转（基于 OpenCC）、汉字转拼音（带声调 / 数字声调 / 首字母）、中文测试假数据生成（姓名、手机号、邮箱、地址），全部在浏览器本地完成。',
    keywords: ['简繁转换', '繁体字转换', '汉字转拼音', '拼音转换', '中文假数据', '测试数据生成'],
  },
  en: {
    title: 'Chinese Tools: Simplified/Traditional Conversion, Pinyin, Fake Data',
    description:
      'Chinese utilities for simplified/traditional conversion, Chinese-to-pinyin output, and Chinese test data generation including names, phone numbers, emails, and addresses.',
    keywords: ['Chinese tools', 'simplified traditional conversion', 'Chinese to pinyin', 'pinyin converter', 'Chinese fake data'],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/chinese', keywords: [...text.keywords], locale });
}

export default async function ChineseToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const locale = await getLocale();
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/chinese', locale })} />
      <ToolsClientPage section="cn-tools" initialTool={tool} />
    </>
  );
}
