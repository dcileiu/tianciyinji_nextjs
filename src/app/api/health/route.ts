import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    statusCode: 200,
    message: "ok",
    data: { healthy: true },
  });
}
