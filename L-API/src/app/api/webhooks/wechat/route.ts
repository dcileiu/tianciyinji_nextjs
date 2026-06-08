import { NextResponse } from "next/server";
import { captureError } from "@/lib/observability";
import { verifyWechatNotify } from "@/server/payments/wechat";
import { grantOrder } from "@/server/services/billing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const result = await verifyWechatNotify(
      {
        timestamp: req.headers.get("wechatpay-timestamp") ?? "",
        nonce: req.headers.get("wechatpay-nonce") ?? "",
        signature: req.headers.get("wechatpay-signature") ?? "",
        serial: req.headers.get("wechatpay-serial") ?? "",
      },
      raw,
    );
    if (!result) {
      return NextResponse.json({ code: "FAIL", message: "验签失败" }, { status: 401 });
    }
    if (result.trade_state === "SUCCESS") {
      await grantOrder(result.out_trade_no, result.transaction_id);
    }
    return NextResponse.json({ code: "SUCCESS" });
  } catch (err) {
    captureError(err, { scope: "wechat-webhook" });
    return NextResponse.json({ code: "FAIL" }, { status: 500 });
  }
}
