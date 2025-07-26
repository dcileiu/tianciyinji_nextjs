'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useArticleStore } from '@/store/articleStore';
import { MdPreview, MdCatalog } from 'md-editor-rt';
import 'md-editor-rt/lib/preview.css';

export default function ArticleDetailPage() {
  const params = useParams();
  const { resolvedTheme } = useTheme();
  const { fetchArticleById, currentArticle, articleLoading, error } = useArticleStore();
  const [displayTheme, setDisplayTheme] = useState<string>('light');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchArticleById(Number(params.id));
    }
  }, [params.id, fetchArticleById]);

  useEffect(() => {
    // 延迟更新显示主题，避免闪烁
    if (resolvedTheme) {
      const timer = setTimeout(() => {
        setDisplayTheme(resolvedTheme === 'dark' ? 'dark' : 'light');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme]);



  if (articleLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: "var(--text-secondary)" }}>加载文章中...</p>
        </div>
      </div>
    );
  }

  if (error || !currentArticle) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>文章未找到</h2>
          <p style={{ color: "var(--text-secondary)" }}>{error || '请求的文章不存在'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" style={{ backgroundColor: "var(--background)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 w-full">
          <div className="w-full xl:w-[75%] flex-1 px-3 sm:px-4 pb-2 bg-[var(--article-bg)] rounded-lg relative" style={{boxShadow: "0 1px 4px -1px var(--md-shadow)"}}>
            {/* 移动端目录按钮 */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="xl:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: "var(--section-bg)",
                boxShadow: "0 0 2px -1px var(--md-shadow)",
                zIndex: 1000000
              }}
              aria-label="打开文章目录"
            >
              <svg className="w-6 h-6" fill="none" stroke="var(--purple)" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <MdPreview
              className='w-full'
              id="article-preview"
              value={currentArticle.content}
              theme={displayTheme as 'light' | 'dark'}
            />
          </div>
          
          {/* 桌面端目录导航区域 */}
          <aside className="hidden xl:block w-[25%] flex-shrink-0">
            <div className="sticky top-28">
              <div className='rounded-lg p-3' style={{
                backgroundColor: "var(--article-bg)",
                boxShadow: "0 1px 4px -1px var(--md-shadow)",
              }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--catalog-title-color)" }}>
                  📖 文章目录
                </h3>
                <MdCatalog
                  editorId="article-preview"
                  scrollElement={typeof window !== 'undefined' ? document.documentElement : undefined}
                  theme={displayTheme as 'light' | 'dark'}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
      
      {/* 移动端抽屉遮罩 */}
      {isDrawerOpen && (
        <div 
          className="xl:hidden fixed inset-0 bg-opacity-50 z-50 transition-opacity"
          style={{backgroundColor: "rgba(0, 0, 0, 0.3)"}}
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      {/* 移动端抽屉 */}
      <div className={`xl:hidden fixed top-0 right-0 h-full w-[70%] z-[1587954520] transform transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`} style={{
        backgroundColor: "var(--article-bg)",
        boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.1)",
      }}>
        <div className="flex flex-col h-full">
          {/* 抽屉头部 */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-color)" }}>
            <h3 className="text-lg font-semibold" style={{ color: "var(--catalog-title-color)" }}>
              📖 文章目录
            </h3>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="关闭目录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* 抽屉内容 */}
          <div className="flex-1 overflow-y-auto p-4">
            <MdCatalog
              editorId="article-preview"
              scrollElement={typeof window !== 'undefined' ? document.documentElement : undefined}
              theme={displayTheme as 'light' | 'dark'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}