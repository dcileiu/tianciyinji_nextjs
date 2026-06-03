import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { getLocale } from '@/lib/i18n-server';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '前端 / CSS 工具：渐变生成、box-shadow、圆角、调色板',
    description:
      '面向前端与设计的可视化在线工具：CSS 渐变生成器（线性 / 径向）、box-shadow 阴影生成、border-radius 圆角生成与调色板生成，所见即所得并一键复制 CSS 代码。',
    keywords: ['CSS 渐变生成器', 'box-shadow 生成', 'border-radius 生成', '圆角生成', '调色板生成', 'CSS 工具'],
  },
  en: {
    title: 'Frontend / CSS Tools: Gradient, box-shadow, Border Radius, Palette',
    description: 'Visual CSS generators for frontend and design work: linear/radial gradients, box-shadow, border radius, and color palettes with copy-ready CSS.',
    keywords: ['CSS gradient generator', 'box-shadow generator', 'border radius generator', 'color palette generator', 'CSS tools'],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/css', keywords: [...text.keywords], locale });
}

export default async function CssToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const locale = await getLocale();
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/css' })} />
      <ToolsClientPage section="css-tools" initialTool={tool} />
    </>
  );
}
