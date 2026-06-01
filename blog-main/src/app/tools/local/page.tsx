import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('纯本地工具：AES、Base64、MD5、JSON、时间戳、代码混淆');

const description =
  '纯本地在线工具集合：AES 加解密、Base64 编解码、MD5 计算与校验、随机数与随机字符串、时间戳转换、JSON 美化压缩、代码混淆压缩、参数分析与敏感词检测，全部在浏览器或本站服务端本地完成。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/local',
  keywords: ['AES 加解密', 'Base64', 'MD5', 'JSON 美化', '时间戳转换', '代码混淆', '敏感词检测'],
});

export default async function LocalToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/local' })} />
      <ToolsClientPage section="local-tools" initialTool={tool} />
    </>
  );
}
