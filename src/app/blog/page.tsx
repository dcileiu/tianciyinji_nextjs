import {
  getCategoriesOrdered,
  getPublishedArticlesPage,
} from "@/server/queries/blog";
import type { Article, Category, Pagination } from "@/store/articleStore";
import BlogPageClient from "./BlogPageClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let hasServerData = false;
  let initialArticles: Article[] = [];
  let initialCategories: Category[] = [];
  let initialPagination: Pagination | null = null;

  try {
    const pub = await getPublishedArticlesPage(1);
    initialArticles = pub.data as unknown as Article[];
    initialPagination = pub.pagination;
    const cats = await getCategoriesOrdered();
    initialCategories = cats as unknown as Category[];
    hasServerData = true;
  } catch {
    /* 无数据库或连接失败时由客户端回退请求 */
  }

  return (
    <BlogPageClient
      hasServerData={hasServerData}
      initialArticles={initialArticles}
      initialCategories={initialCategories}
      initialPagination={initialPagination}
    />
  );
}
