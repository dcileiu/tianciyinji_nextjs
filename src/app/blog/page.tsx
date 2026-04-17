import {
  getCategoriesOrdered,
  getPublishedArticlesPage,
} from "@/server/queries/blog";
import type { Article, Category, Pagination } from "@/store/articleStore";
import BlogPageClient from "./BlogPageClient";
import StructuredData from "@/components/StructuredData";

export const revalidate = 60;

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
    <>
      <StructuredData type="blog" />
      <StructuredData
        type="breadcrumb"
        data={{
          items: [
            { name: '首页', url: 'https://itianci.cn' },
            { name: '博客', url: 'https://itianci.cn/blog' },
          ],
        }}
      />
      <BlogPageClient
        hasServerData={hasServerData}
        initialArticles={initialArticles}
        initialCategories={initialCategories}
        initialPagination={initialPagination}
      />
    </>
  );
}
