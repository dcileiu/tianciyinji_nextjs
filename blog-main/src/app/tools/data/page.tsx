import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { getLocale } from '@/lib/i18n-server';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '公开数据工具：Minecraft、GitHub、Gravatar、手机号归属、Bing 壁纸',
    description:
      '基于公开协议与免费数据源的在线查询工具：Minecraft 玩家与服务器信息、GitHub 仓库信息、Gravatar、基础 IP 归属、手机号归属地、Bing 每日壁纸，以及答案之书 / 诗词 / 历史今天。',
    keywords: ['Minecraft 玩家信息', 'GitHub 仓库信息', 'Gravatar', '手机号归属地', 'Bing 每日壁纸'],
  },
  en: {
    title: 'Public Data Tools: Minecraft, GitHub, Gravatar, Mobile Area, Bing Wallpaper',
    description:
      'Lookup tools based on public protocols and free data sources: Minecraft player/server info, GitHub repositories, Gravatar, IP lookup, mobile area, Bing wallpaper, and lightweight inspiration utilities.',
    keywords: ['Minecraft player info', 'GitHub repository info', 'Gravatar', 'mobile area lookup', 'Bing wallpaper'],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/data', keywords: [...text.keywords], locale });
}

export default async function DataToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const locale = await getLocale();
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/data' })} />
      <ToolsClientPage section="public-data-tools" initialTool={tool} />
    </>
  );
}
