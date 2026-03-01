import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 文章数据类型（基于API接口定义）
export interface Article {
  id: number;
  title: string;
  content?: string;
  category: string;
  tags: string[];
  isPublished: boolean;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  order?: number;
}

// 分类数据类型
export interface Category {
  id: number;
  name: string;
  key: string;
  order: number;
} 

// 分页信息
export interface Pagination {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API响应格式
export interface ArticleResponse {
  statusCode: number;
  data: {
    data: Article[];
    pagination: Pagination;
  };
}

// 相邻文章类型
export interface AdjacentArticles {
  previous: Article | null;
  next: Article | null;
}

// Store状态类型
interface ArticleState {
  // 状态
  articles: Article[];
  categories: Category[];
  loading: boolean;
  categoriesLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  selectedCategory: string;
  currentArticle: Article | null;
  articleLoading: boolean;
  adjacentArticles: AdjacentArticles | null;
  adjacentLoading: boolean;
  
  // Actions
  fetchArticles: (page?: number) => Promise<void>;
  fetchPublishedArticles: (page?: number) => Promise<void>;
  fetchArticlesByCategory: (category: string, page?: number) => Promise<void>;
  fetchArticlesByTag: (tag: string, page?: number) => Promise<void>;
  fetchArticleById: (id: number) => Promise<void>;
  fetchAdjacentArticles: (id: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  clearError: () => void;
  reset: () => void;
}

// API基础URL（可以从环境变量获取）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API调用函数
const apiCall = async (endpoint: string): Promise<ArticleResponse> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// 创建Zustand store
export const useArticleStore = create<ArticleState>()(devtools(
  (set, get) => ({
    // 初始状态
    articles: [],
    categories: [],
    loading: false,
    categoriesLoading: false,
    error: null,
    pagination: null,
    selectedCategory: '全部',
    currentArticle: null,
    articleLoading: false,
    adjacentArticles: null,
    adjacentLoading: false,
    
    // 获取所有文章
    fetchArticles: async (page = 1) => {
      set({ loading: true, error: null });
      try {
        const response = await apiCall(`/api/articles?page=${page}`);
        console.log('response：',response)
        set({
          articles: response.data.data,
          pagination: response.data.pagination,
          loading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取文章失败',
          loading: false,
        });
      }
    },
    
    // 获取已发布文章
    fetchPublishedArticles: async (page = 1) => {
      set({ loading: true, error: null });
      try {
        const response = await apiCall(`/api/articles/published?page=${page}`);
        console.log('1：',response)
        set({
          articles: response.data.data,
          pagination: response.data.pagination,
          loading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取已发布文章失败',
          loading: false,
        });
      }
    },
    
    // 按分类获取文章
    fetchArticlesByCategory: async (category: string, page = 1) => {
      set({ loading: true, error: null });
      try {
        const response = await apiCall(`/api/articles/category/${category}?page=${page}`);
        set({
          articles: response.data.data,
          pagination: response.data.pagination,
          loading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取分类文章失败',
          loading: false,
        });
      }
    },
    
    // 按标签获取文章
    fetchArticlesByTag: async (tag: string, page = 1) => {
      set({ loading: true, error: null });
      try {
        const response = await apiCall(`/api/articles/tag/${tag}?page=${page}`);
        set({
          articles: response.data.data,
          pagination: response.data.pagination,
          loading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取标签文章失败',
          loading: false,
        });
      }
    },
    
    // 根据ID获取单篇文章
    fetchArticleById: async (id: number) => {
      set({ articleLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        set({
          currentArticle: data.data || data,
          articleLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取文章详情失败',
          articleLoading: false,
        });
      }
    },
    
    // 获取相邻文章
    fetchAdjacentArticles: async (id: number) => {
      set({ adjacentLoading: true, error: null });
      try {
        const { articles } = get();
        
        // 如果没有文章列表，先获取已发布的文章
        if (articles.length === 0) {
          await get().fetchPublishedArticles(1);
        }
        
        // 从当前文章列表中查找相邻文章
        const currentArticles = get().articles;
        const currentIndex = currentArticles.findIndex(article => article.id === id);
        
        const adjacentArticles: AdjacentArticles = {
          previous: currentIndex > 0 ? currentArticles[currentIndex - 1] : null,
          next: currentIndex < currentArticles.length - 1 ? currentArticles[currentIndex + 1] : null,
        };
        
        set({
          adjacentArticles,
          adjacentLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取相邻文章失败',
          adjacentLoading: false,
        });
      }
    },
    
    // 获取所有分类
    fetchCategories: async () => {
      set({ categoriesLoading: true, error: null });
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        set({
          categories: data.data || data, // 适配不同的响应格式
          categoriesLoading: false,
        });
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '获取分类失败',
          categoriesLoading: false,
        });
      }
    },
    
    // 设置选中的分类
    setSelectedCategory: (category: string) => {
      set({ selectedCategory: category });
    },
    
    // 清除错误
    clearError: () => {
      set({ error: null });
    },
    
    // 重置状态
    reset: () => {
      set({
        articles: [],
        categories: [],
        loading: false,
        categoriesLoading: false,
        error: null,
        pagination: null,
        selectedCategory: '全部',
        currentArticle: null,
        articleLoading: false,
        adjacentArticles: null,
        adjacentLoading: false,
      });
    },
  }),
  {
    name: 'article-store', // devtools中显示的名称
  }
));