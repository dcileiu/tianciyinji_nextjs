import type { Metadata } from 'next';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle, siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: pageTitle('工具'),
  description: '集合纯本地工具、图片处理、网络基础能力和公开数据接口的小工具菜单。',
  openGraph: {
    title: pageTitle('工具'),
    description: '集合纯本地工具、图片处理、网络基础能力和公开数据接口的小工具菜单。',
    siteName: siteConfig.name,
  },
};

export default function ToolsPage() {
  return <ToolsClientPage />;
}
