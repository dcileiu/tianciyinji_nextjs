import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/server/db/client";
import { advertisements } from "@/server/db/schema";

export const runtime = "nodejs";

const PAGE_SIZE = 10;

/** 对外路径：`/api/advertisements/position/<slot>`；原 Nitro 的 `/api/advertisements/position-<slot>` 由 next.config rewrites 转发到此 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ position: string }> },
) {
  const { position: positionParam } = await context.params;
  const position = decodeURIComponent(positionParam ?? "");
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, totalResult] = await Promise.all([
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

  const total = Number(totalResult[0]?.total || 0);

  return NextResponse.json({
    statusCode: 200,
    data: {
      data: rows,
      pagination: {
        current: page || 1,
        pageSize: PAGE_SIZE,
        total,
      },
    },
  });
}
