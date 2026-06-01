import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('公开数据工具：Minecraft、GitHub、Gravatar、手机号归属、Bing 壁纸');

const description =
  '基于公开协议与免费数据源的在线查询工具：Minecraft 玩家与服务器信息、GitHub 仓库信息、Gravatar、基础 IP 归属、手机号归属地、Bing 每日壁纸，以及答案之书 / 诗词 / 历史今天。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/data',
  keywords: ['Minecraft 玩家信息', 'GitHub 仓库信息', 'Gravatar', '手机号归属地', 'Bing 每日壁纸'],
});

export default async function DataToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/data' })} />
      <ToolsClientPage section="public-data-tools" initialTool={tool} />
    </>
  );
}
