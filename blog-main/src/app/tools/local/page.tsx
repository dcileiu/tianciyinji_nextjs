import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('纯本地工具：字数统计、金额大写、正则测试、颜色工具、JSON/CSV、AES、Base64、MD5');

const description =
  '纯本地在线工具集合：字数统计、人民币金额大写、正则表达式测试、颜色工具与 CSS 渐变、JSON ↔ CSV 互转、AES 加解密、Base64 编解码、MD5 计算与校验、随机数、时间戳转换、JSON 美化压缩、代码混淆与敏感词检测，全部在浏览器或本站服务端本地完成。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/local',
  keywords: [
    '字数统计',
    '人民币金额大写',
    '正则表达式测试',
    '颜色工具',
    'CSS 渐变生成',
    'JSON 转 CSV',
    'JWT 解码',
    'Cron 表达式',
    'SHA 哈希',
    '进制转换',
    '文本对比',
    '命名转换',
    'AES 加解密',
    'Base64',
    'MD5',
    'JSON 美化',
    '时间戳转换',
    '代码混淆',
  ],
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
