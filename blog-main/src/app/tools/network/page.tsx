import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('网络基础工具：DNS 查询、Ping、端口扫描、URL 状态、网页转 Markdown');

const description =
  '在线网络基础工具：客户端 IP、DNS 查询、Ping 连通性、端口扫描、URL 状态检测、网页元数据与图片提取、网页转 Markdown，面向 URL、域名与网页内容的基础观测分析。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/network',
  keywords: ['DNS 查询', 'Ping', '端口扫描', 'URL 状态检测', '网页转 Markdown', '网页元数据提取'],
});

export default async function NetworkToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/network' })} />
      <ToolsClientPage section="network-tools" initialTool={tool} />
    </>
  );
}
