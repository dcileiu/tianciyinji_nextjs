// 工具目录的单一数据源：被客户端聚合页、各工具独立页、sitemap、导航等共享。
// 这里保持纯数据（无 'use client'），可在服务端与客户端通用。

import { dewatermarkToolUrl } from '@/lib/site-config';

export const sectionMeta = [
  { id: 'local-tools' },
  { id: 'image-tools' },
  { id: 'network-tools' },
  { id: 'public-data-tools' },
  { id: 'seo-geo-tools' },
  { id: 'calc-tools' },
  { id: 'cn-tools' },
  { id: 'css-tools' },
] as const;

export type SectionId = (typeof sectionMeta)[number]['id'];

export const toolCatalog = [
  { id: 'word-count', sectionId: 'local-tools' },
  { id: 'rmb-capital', sectionId: 'local-tools' },
  { id: 'regex-tester', sectionId: 'local-tools' },
  { id: 'color-tool', sectionId: 'local-tools' },
  { id: 'data-convert', sectionId: 'local-tools' },
  { id: 'jwt-decode', sectionId: 'local-tools' },
  { id: 'cron', sectionId: 'local-tools' },
  { id: 'sha-hash', sectionId: 'local-tools' },
  { id: 'base-convert', sectionId: 'local-tools' },
  { id: 'text-diff', sectionId: 'local-tools' },
  { id: 'case-convert', sectionId: 'local-tools' },
  { id: 'aes', sectionId: 'local-tools' },
  { id: 'base64', sectionId: 'local-tools' },
  { id: 'md5', sectionId: 'local-tools' },
  { id: 'random', sectionId: 'local-tools' },
  { id: 'timestamp', sectionId: 'local-tools' },
  { id: 'json', sectionId: 'local-tools' },
  { id: 'code-obfuscate', sectionId: 'local-tools' },
  { id: 'params', sectionId: 'local-tools' },
  { id: 'sensitive', sectionId: 'local-tools' },
  { id: 'favicon', sectionId: 'image-tools' },
  { id: 'image-convert', sectionId: 'image-tools' },
  { id: 'image-resize', sectionId: 'image-tools' },
  { id: 'image-watermark', sectionId: 'image-tools' },
  { id: 'color-extract', sectionId: 'image-tools' },
  { id: 'qrcode', sectionId: 'image-tools' },
  { id: 'image-base64', sectionId: 'image-tools' },
  { id: 'svg-image', sectionId: 'image-tools' },
  { id: 'image-compress', sectionId: 'image-tools' },
  { id: 'pet-gif', sectionId: 'image-tools' },
  { id: 'llms-txt', sectionId: 'seo-geo-tools' },
  { id: 'site-traffic', sectionId: 'seo-geo-tools' },
  { id: 'meta-tags', sectionId: 'seo-geo-tools' },
  { id: 'robots-txt', sectionId: 'seo-geo-tools' },
  { id: 'json-ld', sectionId: 'seo-geo-tools' },
  { id: 'keyword-density', sectionId: 'seo-geo-tools' },
  { id: 'client-ip', sectionId: 'network-tools' },
  { id: 'dns-lookup', sectionId: 'network-tools' },
  { id: 'ping', sectionId: 'network-tools' },
  { id: 'port-scan', sectionId: 'network-tools' },
  { id: 'url-status', sectionId: 'network-tools' },
  { id: 'web-metadata', sectionId: 'network-tools' },
  { id: 'web-images', sectionId: 'network-tools' },
  { id: 'web-markdown', sectionId: 'network-tools' },
  { id: 'minecraft-player', sectionId: 'public-data-tools' },
  { id: 'minecraft-server', sectionId: 'public-data-tools' },
  { id: 'github-repo', sectionId: 'public-data-tools' },
  { id: 'gravatar', sectionId: 'public-data-tools' },
  { id: 'ip-geo', sectionId: 'public-data-tools' },
  { id: 'mobile-area', sectionId: 'public-data-tools' },
  { id: 'bing-wallpaper', sectionId: 'public-data-tools' },
  { id: 'content-tools', sectionId: 'public-data-tools' },
  { id: 'loan', sectionId: 'calc-tools' },
  { id: 'income-tax', sectionId: 'calc-tools' },
  { id: 'bmi', sectionId: 'calc-tools' },
  { id: 'date-diff', sectionId: 'calc-tools' },
  { id: 'unit-convert', sectionId: 'calc-tools' },
  { id: 'hanzi-convert', sectionId: 'cn-tools' },
  { id: 'pinyin', sectionId: 'cn-tools' },
  { id: 'chinese-faker', sectionId: 'cn-tools' },
  { id: 'css-gradient', sectionId: 'css-tools' },
  { id: 'box-shadow', sectionId: 'css-tools' },
  { id: 'border-radius', sectionId: 'css-tools' },
  { id: 'palette', sectionId: 'css-tools' },
] as const satisfies ReadonlyArray<{ id: string; sectionId: SectionId }>;

export type ToolId = (typeof toolCatalog)[number]['id'];

// 路由段（文件夹名）<-> sectionId 的映射。
export const SEGMENTS = ['local', 'image', 'network', 'data', 'seo', 'calc', 'chinese', 'css'] as const;
export type ToolSegment = (typeof SEGMENTS)[number];

export const sectionIdBySegment: Record<ToolSegment, SectionId> = {
  local: 'local-tools',
  image: 'image-tools',
  network: 'network-tools',
  data: 'public-data-tools',
  seo: 'seo-geo-tools',
  calc: 'calc-tools',
  chinese: 'cn-tools',
  css: 'css-tools',
};

export const segmentBySectionId: Record<SectionId, ToolSegment> = {
  'local-tools': 'local',
  'image-tools': 'image',
  'network-tools': 'network',
  'public-data-tools': 'data',
  'seo-geo-tools': 'seo',
  'calc-tools': 'calc',
  'cn-tools': 'chinese',
  'css-tools': 'css',
};

export function toolsBySegment(segment: ToolSegment): ToolId[] {
  const sectionId = sectionIdBySegment[segment];
  return toolCatalog.filter((tool) => tool.sectionId === sectionId).map((tool) => tool.id);
}

export function isToolInSegment(segment: ToolSegment, toolId: string): toolId is ToolId {
  return toolsBySegment(segment).includes(toolId as ToolId);
}

// 工具 id -> 路由路径（不含 locale 前缀）。
export function toolHref(toolId: ToolId): string {
  const tool = toolCatalog.find((item) => item.id === toolId);
  if (!tool) return '/tools';
  return `/tools/${segmentBySectionId[tool.sectionId]}/${toolId}`;
}

/** 侧栏工具子菜单：精选分组与条目（单一数据源） */
export type ToolNavEntry =
  | { kind: 'page'; href: string; labelKey: string }
  | { kind: 'tool'; id: ToolId };

export type ToolNavGroupId = 'common-tools' | 'seo-geo-tools' | 'dev-tools' | 'calc-tools';

export const toolNavMenuGroups: ReadonlyArray<{
  id: ToolNavGroupId;
  /** i18n key under toolsPage.navMenu，或以 section. 前缀复用分区标题 */
  labelKey: string;
  entries: readonly ToolNavEntry[];
}> = [
  {
    id: 'common-tools',
    labelKey: 'commonTools',
    entries: [
      { kind: 'page', href: dewatermarkToolUrl, labelKey: 'dewatermark' },
    ],
  },
  {
    id: 'seo-geo-tools',
    labelKey: 'section.seo-geo-tools',
    entries: [
      { kind: 'tool', id: 'llms-txt' },
      { kind: 'tool', id: 'site-traffic' },
      { kind: 'tool', id: 'meta-tags' },
      { kind: 'tool', id: 'robots-txt' },
      { kind: 'tool', id: 'json-ld' },
      { kind: 'tool', id: 'keyword-density' },
    ],
  },
  {
    id: 'dev-tools',
    labelKey: 'devTools',
    entries: [
      { kind: 'tool', id: 'word-count' },
      { kind: 'tool', id: 'regex-tester' },
      { kind: 'tool', id: 'jwt-decode' },
    ],
  },
  {
    id: 'calc-tools',
    labelKey: 'section.calc-tools',
    entries: [
      { kind: 'tool', id: 'loan' },
      { kind: 'tool', id: 'income-tax' },
      { kind: 'tool', id: 'bmi' },
      { kind: 'tool', id: 'date-diff' },
      { kind: 'tool', id: 'unit-convert' },
    ],
  },
] as const;
