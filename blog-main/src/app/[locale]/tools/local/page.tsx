import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { getLocale } from '@/lib/i18n-server';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '纯本地工具：字数统计、金额大写、正则测试、颜色工具、JSON/CSV、AES、Base64、MD5',
    description:
      '纯本地在线工具集合：字数统计、人民币金额大写、正则表达式测试、颜色工具与 CSS 渐变、JSON 与 CSV 互转、AES 加解密、Base64 编解码、MD5 计算与校验、随机数、时间戳转换、JSON 美化压缩、代码混淆与敏感词检测，全部在本地完成，安全不上传。',
    keywords: ['字数统计', '人民币金额大写', '正则表达式测试', '颜色工具', 'JSON 转 CSV', 'AES 加解密', 'Base64', 'MD5', 'JSON 美化'],
  },
  en: {
    title: 'Local Tools: Word Count, Regex, Color, JSON/CSV, AES, Base64, MD5',
    description:
      'A browser-local toolkit for word count, RMB uppercase, regex testing, color tools, JSON/CSV conversion, AES encryption, Base64, MD5, random values, timestamps, JSON formatting, code minification, and sensitive word checks.',
    keywords: ['local tools', 'word count', 'regex tester', 'color tool', 'JSON CSV', 'AES encryption', 'Base64', 'MD5', 'JSON formatter'],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/local', keywords: [...text.keywords], locale });
}

export default async function LocalToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const locale = await getLocale();
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/local', locale })} />
      <ToolsClientPage section="local-tools" initialTool={tool} />
    </>
  );
}
