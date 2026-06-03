import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { getLocale } from '@/lib/i18n-server';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: 'SEO | GEO 工具：llms.txt、Meta 标签、robots.txt、JSON-LD、关键词密度',
    description:
      '面向搜索引擎（SEO）与生成式 AI（GEO）的在线优化工具集合：llms.txt 生成器、Meta 标签 / TDK 生成、robots.txt 生成器、结构化数据 JSON-LD 生成与关键词密度分析，帮助网站更好地被搜索引擎和大模型理解与引用。',
    keywords: ['llms.txt 生成器', 'Meta 标签生成', 'TDK 生成', 'robots.txt 生成器', '结构化数据', 'JSON-LD', '关键词密度', 'SEO 工具', 'GEO 工具'],
  },
  en: {
    title: 'SEO | GEO Tools: llms.txt, Meta Tags, robots.txt, JSON-LD, Keyword Density',
    description:
      'Online optimization tools for search engines and generative AI: llms.txt generator, meta / TDK generator, robots.txt, JSON-LD structured data, and keyword density analysis.',
    keywords: ['llms.txt generator', 'meta tag generator', 'TDK generator', 'robots.txt generator', 'structured data', 'JSON-LD', 'keyword density', 'SEO tools', 'GEO tools'],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/seo', keywords: [...text.keywords], locale });
}

export default async function SeoToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const locale = await getLocale();
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/seo' })} />
      <ToolsClientPage section="seo-geo-tools" initialTool={tool} />
    </>
  );
}
