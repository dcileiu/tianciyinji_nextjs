import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const toolsPageTitle = pageTitle(
  '在线工具箱：llms.txt 生成器、代码混淆压缩、AES、Base64、MD5、JSON、二维码',
);

const toolsPageDescription =
  '免费在线工具聚合页，提供 llms.txt 生成器、代码混淆与压缩、AES 加解密、Base64 编解码、MD5 计算与校验、随机数与随机字符串、时间戳转换、JSON 美化与压缩、参数分析、敏感词快速检测、二维码生成、图片与 Base64 互转、SVG 转图片、图片压缩、摸头 GIF、客户端 IP、DNS 查询、Ping、端口扫描、URL 状态检测、网页元数据提取、网页图片提取、网页转 Markdown、Minecraft 玩家与服务器信息、GitHub 仓库信息、Gravatar、基础 IP 归属、手机号归属地、Bing 每日壁纸、答案之书、诗词与历史今天等工具。';

const toolsPageKeywords = [
  '在线工具箱',
  'llms.txt 生成器',
  'AES 加解密',
  'Base64 编解码',
  'MD5 计算',
  '随机字符串生成器',
  '时间戳转换',
  'JSON 美化',
  '代码混淆',
  'JavaScript 压缩',
  '参数分析',
  '敏感词检测',
  '二维码生成',
  '图片转 Base64',
  'SVG 转图片',
  '图片压缩',
  '摸头 GIF',
  '客户端 IP',
  'DNS 查询',
  'Ping',
  '端口扫描',
  'URL 状态检测',
  '网页元数据提取',
  '网页图片提取',
  '网页转 Markdown',
  'Minecraft 玩家信息',
  'Minecraft 服务器信息',
  'GitHub 仓库信息',
  'Gravatar',
  'IP 归属查询',
  '手机号归属地',
  'Bing 每日壁纸',
  '答案之书',
  '诗词',
  '历史今天',
] as const;

export const metadata: Metadata = buildPageMetadata({
  title: toolsPageTitle,
  description: toolsPageDescription,
  path: '/tools',
  keywords: [...toolsPageKeywords],
});

export default function ToolsPage() {
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: toolsPageTitle,
          description: toolsPageDescription,
          path: '/tools',
        })}
      />
      <ToolsClientPage />
    </>
  );
}
