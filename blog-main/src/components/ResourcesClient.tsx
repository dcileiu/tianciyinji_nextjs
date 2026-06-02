'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
  matchResourceCategory,
} from '@/lib/resource-categories';
import { LiveCodeRenderer } from './LiveCodeRenderer';

interface Resource {
  title: string;
  description: string;
  slug: string;
  category?: string;
  type?: string;
  format?: string;
  size?: string;
  lastUpdated?: string;
  downloadUrl?: string;
  tags?: string[];
  sample?: string;
}

interface ResourcesClientProps {
  resources: Resource[];
}

// 解码 HTML 实体
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// 从 HTML 内容中提取代码块（支持 tsx/jsx/typescript）
function extractCodeFromHtml(html: string): string {
  const match = html.match(/<code[^>]*>([\s\S]*?)<\/code>/);
  if (match) {
    const code = match[1].replace(/<[^>]*>/g, '').trim();
    return decodeHtmlEntities(code);
  }
  return '';
}

// 从 HTML 内容中提取描述（代码块之前的文本）
function extractDescriptionFromHtml(html: string): string {
  const parts = html.split(/<pre[^>]*>/);
  if (parts[0]) {
    return parts[0].replace(/<[^>]*>/g, '').trim();
  }
  return '';
}

type MainTab = 'resources' | 'commands' | 'design';

const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'resources', label: '资源' },
  { id: 'commands', label: '命令' },
  { id: 'design', label: '设计' },
];

const tabContentMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
};

const pillTransition = { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

export default function ResourcesClient({ resources }: ResourcesClientProps) {
  const [activeTab, setActiveTab] = useState<MainTab>('resources');
  const [activeCategory, setActiveCategory] = useState<ResourceCategoryId>('all');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedTab = localStorage.getItem('resources-tab') as MainTab | null;
    const savedCategory = localStorage.getItem('resources-category') as ResourceCategoryId | null;

    if (savedTab) {
      setActiveTab(savedTab);
    }
    if (savedCategory && RESOURCE_CATEGORIES.some((item) => item.id === savedCategory)) {
      setActiveCategory(savedCategory);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('resources-tab', activeTab);
    }
  }, [activeTab, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('resources-category', activeCategory);
    }
  }, [activeCategory, isHydrated]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [designFilter, setDesignFilter] = useState<string | null>(null);

  // 分离普通资源、命令资源和设计资源
  const normalResources = resources.filter((r) => r.type !== 'command' && r.type !== 'design');
  const commandResources = resources.filter((r) => r.type === 'command');
  const designResources = resources.filter((r) => r.type === 'design');
  const filteredResources = normalResources.filter((resource) =>
    matchResourceCategory(resource.category, activeCategory),
  );

  const copyToClipboard = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const shouldBlockPreviewNavigation = (target: EventTarget | null) => {
    const node = target as HTMLElement | null;
    if (!node) return false;
    return Boolean(
      node.closest('button, [role="button"], input, textarea, select, label, a, [data-prevent-preview-nav="true"]')
    );
  };

  // 在 hydration 完成前不渲染内容，避免闪烁
  if (!isHydrated) {
    return (
      <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 py-12 sm:py-16 md:py-24">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-3 sm:mb-4">
            资源
          </h1>
          <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 leading-relaxed">
            整理的实用资源和数据集，全部免费开放使用
          </p>
          <div className="w-12 sm:w-16 h-[2px] bg-black dark:bg-white" />
        </header>
        <div className="h-12 w-48 bg-black/[0.04] dark:bg-white/[0.06] rounded-full mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl" />
          <div className="h-32 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 md:px-6 py-12 sm:py-16 md:py-24">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-black dark:text-white mb-3 sm:mb-4">
          资源
        </h1>
        <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 leading-relaxed">
          整理的实用资源和数据集，全部免费开放使用
        </p>
        <div className="w-12 sm:w-16 h-[2px] bg-black dark:bg-white" />
      </header>

      {/* 主 Tab */}
      <div className="flex gap-1 p-1 mb-4 bg-[#efe8ff]/80 dark:bg-[#1d162f]/80 rounded-full w-fit">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative z-10 px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeTab === tab.id
              ? 'text-[#2e2150] dark:text-[#f0ebff]'
              : 'text-[#716397] dark:text-[#ac9cd8] hover:text-[#4f31d7] dark:hover:text-[#f0ebff]'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="resources-main-tab"
                className="absolute inset-0 -z-10 rounded-full bg-white dark:bg-[#241c38] shadow-sm"
                transition={pillTransition}
              />
            )}
          </button>
        ))}
      </div>

      {/* 资源分类 Tab */}
      <AnimatePresence>
        {activeTab === 'resources' && (
          <motion.div
            key="resource-categories"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 -mx-1 overflow-x-auto pb-1"
          >
            <div className="flex min-w-max gap-2 px-1">
              {RESOURCE_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`relative inline-flex flex-col items-center gap-1.5 min-w-[4.5rem] px-3 py-2.5 rounded-2xl transition-colors duration-200 ${isActive
                      ? 'text-[#4f31d7] dark:text-[#f0ebff]'
                      : 'text-[#7c6daa] dark:text-[#ac9cd8] hover:text-[#5b3df5] dark:hover:text-[#d8cdff]'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="resources-category-tab"
                        className="absolute inset-0 -z-10 rounded-2xl bg-[#efe8ff] dark:bg-[#241c38] shadow-[0_8px_24px_rgba(91,61,245,0.10)]"
                        transition={pillTransition}
                      />
                    )}
                    <Icon className={`relative h-5 w-5 ${isActive ? 'text-[#5b3df5] dark:text-[#d8cdff]' : ''}`} />
                    <span className="relative text-xs font-medium whitespace-nowrap">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* 资源列表 */}
        {activeTab === 'resources' && (
          <motion.div key="resources" {...tabContentMotion}>
            {normalResources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black/60 dark:text-white/60 mb-4">暂无资源</p>
                <p className="text-sm text-black/40 dark:text-white/40">
                  资源正在持续整理中，欢迎稍后再来看看。
                </p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black/60 dark:text-white/60 mb-2">
                  {RESOURCE_CATEGORIES.find((item) => item.id === activeCategory)?.label ?? '该分类'} 下暂无资源
                </p>
                <p className="text-sm text-black/40 dark:text-white/40">
                  换个分类看看，或稍后再来。
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredResources.map((resource, index) => (
                  <article
                    key={index}
                    className="group py-6 border-b border-black/[0.06] dark:border-white/[0.06] last:border-0"
                  >
                    <div className="space-y-4 sm:space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <Link href={`/resources/${resource.slug}` as any}>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-black dark:text-white mb-2 sm:mb-2 hover:text-black/70 dark:hover:text-white/70 transition-colors cursor-pointer">
                              {resource.title}
                            </h2>
                          </Link>
                          <p className="text-sm sm:text-base text-black/60 dark:text-white/60 leading-relaxed">
                            {resource.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 sm:mt-1">
                          <span className="text-xs sm:text-sm text-black/40 dark:text-white/40">{resource.type}</span>
                          {resource.format && (
                            <>
                              <span className="text-xs text-black/20 dark:text-white/20">·</span>
                              <span className="text-xs sm:text-sm text-black/40 dark:text-white/40">
                                {resource.format}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg sm:rounded-xl bg-black/[0.02] dark:bg-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5 md:gap-6">
                          <div className="flex items-center gap-6 sm:gap-8 md:gap-12">
                            {resource.size && (
                              <div className="space-y-0.5 sm:space-y-1">
                                <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                                  {resource.size}
                                </h4>
                                <p className="text-xs sm:text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">
                                  文件大小
                                </p>
                              </div>
                            )}
                            {resource.lastUpdated && (
                              <div className="space-y-0.5 sm:space-y-1">
                                <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black dark:text-white tracking-tight">
                                  {resource.lastUpdated}
                                </h4>
                                <p className="text-xs sm:text-xs md:text-sm text-black/70 dark:text-white/70 whitespace-nowrap">
                                  更新时间
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 md:items-end md:flex-shrink-0 w-full sm:w-auto md:w-auto">
                            <Link
                              href={`/resources/${resource.slug}` as any}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white text-sm font-medium hover:bg-black/[0.10] dark:hover:bg-white/[0.12] transition-colors whitespace-nowrap w-full sm:w-auto"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              查看详情
                            </Link>
                            {resource.downloadUrl && (
                              <a
                                href={resource.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2.5 md:py-2 rounded-full bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 active:bg-black/70 dark:active:bg-white/70 transition-colors whitespace-nowrap w-full sm:w-auto"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                下载资源
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {resource.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 sm:px-2.5 py-1 text-xs rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-black/50 dark:text-white/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* 命令列表 */}
        {activeTab === 'commands' && (
          <motion.div key="commands" className="space-y-4 py-6" {...tabContentMotion}>
            {commandResources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black/60 dark:text-white/60">暂无收藏的命令</p>
              </div>
            ) : (
              commandResources.map((cmd) => {
                const code = extractCodeFromHtml(cmd.sample || '');
                const description = extractDescriptionFromHtml(cmd.sample || '') || cmd.description;
                return (
                  <div
                    key={cmd.slug}
                    className="group rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
                  >
                    <div className="px-5 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link href={`/resources/${cmd.slug}` as any}>
                          <h3 className="text-base font-medium text-black dark:text-white mb-1 hover:text-black/70 dark:hover:text-white/70 transition-colors cursor-pointer">
                            {cmd.title}
                          </h3>
                        </Link>
                        {description && <p className="text-sm text-black/50 dark:text-white/50">{description}</p>}
                      </div>
                      <button
                        onClick={() => copyToClipboard(code, cmd.slug)}
                        className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${copiedId === cmd.slug
                          ? 'bg-black/[0.06] dark:bg-white/[0.08] text-black/60 dark:text-white/60'
                          : 'bg-black/[0.06] dark:bg-white/[0.08] text-black dark:text-white hover:bg-black/[0.10] dark:hover:bg-white/[0.12]'
                          }`}
                      >
                        {copiedId === cmd.slug ? (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            已复制
                          </>
                        ) : (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            复制
                          </>
                        )}
                      </button>
                    </div>
                    <div className="px-5 py-3 bg-black/[0.03] dark:bg-white/[0.03] border-t border-black/[0.06] dark:border-white/[0.06] overflow-x-auto">
                      <pre className="text-sm text-black/80 dark:text-white/80 font-mono whitespace-pre-wrap break-all">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* 设计组件列表 */}
        {activeTab === 'design' && (
          <motion.div key="design" className="py-6" {...tabContentMotion}>
            {designResources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-black/60 dark:text-white/60">暂无设计组件</p>
              </div>
            ) : (
              <>
                {/* Tag 筛选 */}
                {(() => {
                  const allTags = Array.from(new Set(designResources.flatMap((r) => r.tags || [])));
                  if (allTags.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button
                        onClick={() => setDesignFilter(null)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${designFilter === null
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                          }`}
                      >
                        全部
                      </button>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setDesignFilter(tag)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${designFilter === tag
                            ? 'bg-black dark:bg-white text-white dark:text-black'
                            : 'bg-black/[0.04] dark:bg-white/[0.06] text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white'
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  );
                })()}

                {/* 组件网格 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {designResources
                    .filter((r) => !designFilter || (r.tags || []).includes(designFilter))
                    .map((component) => {
                      const code = extractCodeFromHtml(component.sample || '');
                      const description = extractDescriptionFromHtml(component.sample || '') || component.description;
                      return (
                        <div
                          key={component.slug}
                          className="rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
                        >
                          {/* 预览区域 - 可点击跳转 */}
                          <Link
                            href={`/resources/${component.slug}` as any}
                            onClickCapture={(e) => {
                              if (shouldBlockPreviewNavigation(e.target)) {
                                e.preventDefault();
                              }
                            }}
                            className="aspect-square flex items-center justify-center p-6 text-black dark:text-white hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                          >
                            {code ? (
                              <LiveCodeRenderer code={code} />
                            ) : (
                              <span className="text-black/30 dark:text-white/30 text-sm">无预览</span>
                            )}
                          </Link>
                          {/* 底部信息栏 */}
                          <div className="px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                            <Link href={`/resources/${component.slug}` as any} className="min-w-0 flex-1">
                              <h3 className="text-sm font-medium text-black dark:text-white truncate hover:text-black/70 dark:hover:text-white/70 transition-colors">
                                {component.title}
                              </h3>
                              {description && (
                                <p className="text-xs text-black/40 dark:text-white/40 truncate">{description}</p>
                              )}
                            </Link>
                            <button
                              onClick={() => copyToClipboard(code, component.slug)}
                              className={`p-2 rounded-full transition-colors flex-shrink-0 ml-2 ${copiedId === component.slug
                                ? 'text-black/40 dark:text-white/40'
                                : 'text-black/50 dark:text-white/50 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                                }`}
                              title={copiedId === component.slug ? '已复制' : '复制代码'}
                            >
                              {copiedId === component.slug ? (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
