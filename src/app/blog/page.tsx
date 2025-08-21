"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useArticleStore } from "@/store/articleStore";
import Loading from "@/components/common/Loading";
import Breadcrumb from "@/components/common/Breadcrumb";

// 辅助函数：格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 辅助函数：计算阅读时间（基于内容长度估算）
const calculateReadTime = (content?: string) => {
  if (!content) return "5分钟";
  const wordsPerMinute = 200;
  const words = content.length / 2; // 中文字符估算
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes}分钟`;
};



export default function BlogPage() {
  const {
    articles,
    categories,
    loading,
    categoriesLoading,
    error,
    selectedCategory,
    fetchPublishedArticles,
    fetchArticlesByCategory,
    fetchCategories,
    setSelectedCategory,
    clearError
  } = useArticleStore();

  useEffect(() => {
    // 页面加载时获取已发布的文章和分类列表
    fetchPublishedArticles(1);
    fetchCategories();
    // 重置滚动位置到顶部
    window.scrollTo(0, 0);
  }, [fetchPublishedArticles, fetchCategories]);

  // 处理分类切换
  const handleCategoryChange = async (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    if (categoryKey === "全部") {
      await fetchPublishedArticles(1);
    } else {
      await fetchArticlesByCategory(categoryKey, 1);
    }
  };

  // 获取所有分类（包含"全部"选项）
  const allCategories = [
    { key: "全部", name: "全部" },
    ...categories.sort((a, b) => a.order - b.order)
  ];

  // 当前显示的文章列表
  const displayedArticles = articles;

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <div className="flex items-center justify-center pt-24 min-h-[50vh]">
          <Loading 
            visible={true} 
            text="加载文章中..." 
            size="small"
          />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>加载失败</h2>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>{error}</p>
            <button
              onClick={() => {
                clearError();
                fetchPublishedArticles(1);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* 面包屑导航 */}
        <Breadcrumb
          items={[
            { label: "技术博客" }
          ]}
          className="mb-6"
        />
        {/* Category Filter */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {categoriesLoading ? (
            <div className="flex items-center gap-2 mb-4">
              <Loading 
                visible={true} 
                text="加载分类中..." 
                size="small"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 sm:gap-4">
              {allCategories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedCategory === category.key
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}
                  style={{
                    color: selectedCategory === category.key ? 'white' : 'var(--text-primary)',
                    backgroundColor: selectedCategory === category.key ? undefined : 'transparent',
                    boxShadow: selectedCategory === category.key ? undefined : 'var(--button-shadow)'
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Blog Posts Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {displayedArticles.map((article, index) => (
            <Link href={`/blog/${article.id}`} key={article.id}>
              <motion.article 
                className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer break-inside-avoid md:mb-8 sm:mb-1"
                style={{ 
                  backgroundColor: 'var(--article-bg)',
                  boxShadow: 'var(--card-shadow)'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
              {/* Cover Image with Overlay */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={article.coverImage || "/default-cover.jpg"}
                  alt={article.title}
                  width={400}
                  height={224}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/8.jpg";
                  }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
                    {categories.find(cat => cat.key === article.category)?.name || article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title */}
                <h2 className="text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-blue-600" style={{ color: "var(--text-primary)" }}>
                  {article.title}
                </h2>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={tag} 
                      className="relative px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer group overflow-hidden"
                      style={{ 
                        backgroundColor: 'rgba(156, 163, 175, 0.15)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(156, 163, 175, 0.2)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-1">
                        <span 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{
                            background: `linear-gradient(135deg, 
                              hsl(${(index * 137 + 180) % 360}, 65%, 60%) 0%, 
                              hsl(${(index * 137 + 240) % 360}, 70%, 70%) 100%)`
                          }}
                        ></span>
                        {tag}
                      </span>
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-200 hover:scale-105" 
                      style={{ 
                        color: 'var(--text-secondary)',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        border: '1px dashed rgba(156, 163, 175, 0.3)',
                        opacity: 0.8
                      }}
                    >
                      +{article.tags.length - 3} 更多
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium">Tianci</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(article.content)}</span>
                  </div>
                </div>
              </div>
            </motion.article>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {displayedArticles.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>暂无文章</h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {selectedCategory === "全部" ? "还没有发布任何文章" : `"${selectedCategory}" 分类下暂无文章`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}