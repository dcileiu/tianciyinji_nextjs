import type { InferSelectModel } from "drizzle-orm";
import type { articles } from "@/server/db/schema";

export type ArticleRow = InferSelectModel<typeof articles>;

export function articleWithTags(row: ArticleRow) {
  return {
    ...row,
    tags: row.tags ? String(row.tags).split(",").filter(Boolean) : [],
  };
}
