import { db } from "../../db/client";
import { articles } from "../../db/schema";
import { sql } from "drizzle-orm";

interface SearchBody {
  keyword?: string;
  page?: number;
}

const PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as SearchBody;

  if (!body?.keyword) {
    return {
      statusCode: 200,
      data: {
        data: [],
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      },
    };
  }

  const keyword = body.keyword;

  try {
    const likePattern = `%${keyword}%`;
    const rows = await db
      .select()
      .from(articles)
      .where(
        sql`${articles.title} LIKE ${likePattern} OR ${articles.content} LIKE ${likePattern} OR ${articles.tags} LIKE ${likePattern}`,
      )
      .orderBy(sql`${articles.createdAt} DESC`);

    return {
      statusCode: 200,
      data: {
        data: rows.map((row) => ({
          ...row,
          tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
        })),
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: rows.length,
          totalPages: 1,
        },
      },
    };
  } catch (error) {
    console.error("搜索文章失败:", error);
    return {
      statusCode: 200,
      data: {
        data: [],
        pagination: {
          current: 1,
          pageSize: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        },
      },
    };
  }
});

