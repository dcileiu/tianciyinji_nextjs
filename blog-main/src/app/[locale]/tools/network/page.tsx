import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { normalizeLocale } from '@/lib/i18n';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '网络基础工具：DNS 查询、Ping、端口扫描、URL 状态、网页转 Markdown',
    description:
      '在线网络基础工具：客户端 IP、DNS 查询、Ping 连通性、端口扫描、URL 状态检测、网页元数据与图片提取、网页转 Markdown，面向 URL、域名与网页内容的基础观测分析。',
    keywords: ['DNS 查询', 'Ping', '端口扫描', 'URL 状态检测', '网页转 Markdown', '网页元数据提取'],
  },
  en: {
    title: 'Network Tools: DNS Lookup, Ping, Port Scan, URL Status, Web to Markdown',
    description:
      'Online network utilities for client IP, DNS lookup, ping, port scanning, URL status checks, webpage metadata and image extraction, and converting web pages to Markdown.',
    keywords: ['DNS lookup', 'Ping', 'port scan', 'URL status check', 'web to Markdown', 'metadata extraction'],
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/network', keywords: [...text.keywords], locale });
}

export default async function NetworkToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/network', locale })} />
      <ToolsClientPage section="network-tools" />
    </>
  );
}
