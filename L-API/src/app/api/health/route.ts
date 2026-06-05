import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateStoreKind } from "@/server/security";

export const dynamic = "force-dynamic";

const bootedAt = Date.now();

export async function GET() {
  let db: "ok" | "down" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }

  const healthy = db === "ok";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: { db, rateStore: rateStoreKind() },
      uptimeSec: Math.floor((Date.now() - bootedAt) / 1000),
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
