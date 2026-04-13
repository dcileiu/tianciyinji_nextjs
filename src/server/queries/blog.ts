import { db } from "@/server/db/client";
import { articles, categories } from "@/server/db/schema";
import { and, asc, eq, sql } from "drizzle-orm";
import { articleWithTags } from "@/server/articles/normalize";

const DEFAULT_PAGE_SIZE = 10;

export async function getPublishedArticlesPage(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const offset = (page - 1) * pageSize;
  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(articles)
      .where(eq(articles.isPublished, 1))
      .orderBy(sql`${articles.order} ASC, ${articles.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)`.as("total") })
      .from(articles)
      .where(eq(articles.isPublished, 1)),
  ]);
  const total = Number(totalResult[0]?.total || 0);
  return {
    data: rows.map(articleWithTags),
    pagination: {
      current: page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getArticleByIdForPublic(id: number) {
  const [row] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, id), eq(articles.isPublished, 1)))
    .limit(1);
  if (!row) return null;
  return articleWithTags(row);
}

/** Admin or public detail without publish filter */
export async function getArticleByIdRaw(id: number) {
  const [row] = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  if (!row) return null;
  return articleWithTags(row);
}

export async function incrementArticleViews(id: number) {
  await db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.id, id));
}

export async function getPublishedArticlesForSitemap() {
  return db
    .select({ id: articles.id, updatedAt: articles.updatedAt })
    .from(articles)
    .where(eq(articles.isPublished, 1));
}

export async function getCategoriesOrdered() {
  return db.select().from(categories).orderBy(asc(categories.order));
}
