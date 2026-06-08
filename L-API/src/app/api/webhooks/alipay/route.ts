import { NextResponse } from "next/server";
import { captureError } from "@/lib/observability";
import { verifyAlipayNotify } from "@/server/payments/alipay";
import { grantOrder } from "@/server/services/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text)) as Record<string, string>;
    if (!verifyAlipayNotify(params)) {
      return new NextResponse("failure", { status: 400 });
    }
    if (params.trade_status === "TRADE_SUCCESS" || params.trade_status === "TRADE_FINISHED") {
      await grantOrder(params.out_trade_no, params.trade_no);
    }
    // 支付宝要求返回纯文本 success 以确认收到
    return new NextResponse("success");
  } catch (err) {
    captureError(err, { scope: "alipay-webhook" });
    return new NextResponse("failure", { status: 500 });
  }
}
