"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useArticleStore, type Article } from "@/store/articleStore";
import { MdPreview, MdCatalog } from "md-editor-rt";
import "md-editor-rt/lib/preview.css";
import Loading from "@/components/common/Loading";
import Breadcrumb from "@/components/common/Breadcrumb";
import { apiUrl } from "@/lib/api-url";

interface ArticleDetailClientProps {
  id: string;
  initialArticle: Article | null;
}

export default function ArticleDetailClient({
  id,
  initialArticle,
}: ArticleDetailClientProps) {
  const { resolvedTheme } = useTheme();
  const { currentArticle, articleLoading, error } = useArticleStore();
  const [displayTheme, setDisplayTheme] = useState<string>("light");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useLayoutEffect(() => {
    if (initialArticle === null) {
      useArticleStore.setState({
        currentArticle: null,
        articleLoading: false,
        error: "文章不存在或未发布",
      });
    } else if (initialArticle) {
      useArticleStore.setState({
        currentArticle: initialArticle,
        articleLoading: false,
        error: null,
      });
    }
  }, [initialArticle]);

  useEffect(() => {
    if (!id) return;
    const n = Number(id);
    if (!n || initialArticle === null) return;
    fetch(apiUrl(`/api/articles/${n}/view`), { method: "POST" }).catch(
      () => {},
    );
  }, [id, initialArticle]);

  useEffect(() => {
    if (resolvedTheme) {
      const timer = setTimeout(() => {
        setDisplayTheme(resolvedTheme === "dark" ? "dark" : "light");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [resolvedTheme]);

  if (articleLoading) {
    return (
      <div
        className="min-h-screen pt-24 flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <Loading visible text="加载文章中..." size="small" />
      </div>
    );
  }

  if (error || !currentArticle) {
    return (
      <div
        className="min-h-screen pt-24 flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="text-center">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            文章未找到
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            {error || "请求的文章不存在"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24" style={{ backgroundColor: "var(--background)" }}>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb
          items={[
            { label: "技术博客", href: "/blog" },
            { label: currentArticle?.title || "文章详情" },
          ]}
          className="mb-6"
        />
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 w-full">
          <div
            className="w-full xl:w-[75%] flex-1 px-3 sm:px-4 pb-2 bg-[var(--article-bg)] rounded-lg relative"
            style={{ boxShadow: "0 1px 4px -1px var(--md-shadow)" }}
          >
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="xl:hidden fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "var(--section-bg)",
                boxShadow: "0 0 2px -1px var(--md-shadow)",
                zIndex: 1000000,
              }}
              aria-label="打开文章目录"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="var(--purple)"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <MdPreview
              className="w-full"
              id="article-preview"
              value={currentArticle.content}
              theme={displayTheme as "light" | "dark"}
            />
          </div>

          <aside className="hidden xl:block w-[25%] flex-shrink-0">
            <div className="sticky top-28">
              <div
                className="rounded-lg p-3"
                style={{
                  backgroundColor: "var(--article-bg)",
                  boxShadow: "0 1px 4px -1px var(--md-shadow)",
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: "var(--catalog-title-color)" }}
                >
                  📖 文章目录
                </h3>
                <MdCatalog
                  editorId="article-preview"
                  scrollElement={
                    typeof window !== "undefined" ? document.documentElement : undefined
                  }
                  theme={displayTheme as "light" | "dark"}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {isDrawerOpen && (
        <div
          role="presentation"
          className="xl:hidden fixed inset-0 bg-opacity-50 z-50 transition-opacity"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div
        className={`xl:hidden fixed top-0 right-0 h-full w-[70%] z-[1587954520] transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--article-bg)",
          boxShadow: "-4px 0 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: "var(--border-color)" }}
          >
            <h3
              className="text-lg font-semibold"
              style={{ color: "var(--catalog-title-color)" }}
            >
              📖 文章目录
            </h3>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="关闭目录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <MdCatalog
              editorId="article-preview"
              scrollElement={
                typeof window !== "undefined" ? document.documentElement : undefined
              }
              theme={displayTheme as "light" | "dark"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
