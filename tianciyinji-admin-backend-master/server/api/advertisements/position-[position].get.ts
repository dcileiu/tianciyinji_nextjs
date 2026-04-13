import { db } from "../../db/client";
import { advertisements } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import { getRouterParam } from "h3";

const PAGE_SIZE = 10;

export default defineEventHandler(async (event) => {
  const position = getRouterParam(event, "position") ?? "";
  const query = getQuery(event);
  const page = Number(query.page ?? 1);

  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(advertisements)
      .where(
        sql`${advertisements.position} = ${position} AND ${advertisements.isVisible} = 1`,
      )
      .orderBy(sql`${advertisements.order} ASC`)
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: sql<number>`COUNT(*)`.as("total") })
      .from(advertisements)
      .where(
        sql`${advertisements.position} = ${position} AND ${advertisements.isVisible} = 1`,
      ),
  ]);

  return {
    statusCode: 200,
    data: {
      data: rows,
      pagination: {
        current: page || 1,
        pageSize: PAGE_SIZE,
        total,
      },
    },
  };
});

