import { NextResponse } from "next/server";
import { getPayConfig, wechatPayRequest } from "@/lib/wechat-pay/wechatPay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const outTradeNo = String(body?.outTradeNo || "").trim();
    if (!outTradeNo) {
      return NextResponse.json(
        { success: false, error: "缺少 outTradeNo" },
        { status: 400 },
      );
    }

    const { mchid } = getPayConfig();
    const encodedOutTradeNo = encodeURIComponent(outTradeNo);
    const canonicalUrl = `/v3/pay/transactions/out-trade-no/${encodedOutTradeNo}?mchid=${encodeURIComponent(mchid)}`;
    const data = (await wechatPayRequest({
      method: "GET",
      canonicalUrl,
    })) as {
      trade_state?: string;
      trade_state_desc?: string;
      transaction_id?: string;
      amount?: { total?: number };
      payer?: { openid?: string };
    };

    return NextResponse.json({
      success: true,
      outTradeNo,
      tradeState: data?.trade_state || "",
      tradeStateDesc: data?.trade_state_desc || "",
      transactionId: data?.transaction_id || "",
      amountFen: data?.amount?.total || 0,
      payerOpenid: data?.payer?.openid || "",
      message:
        data?.trade_state === "SUCCESS"
          ? "支付成功"
          : data?.trade_state_desc || "订单状态待确认",
    });
  } catch (error) {
    console.error("[payment/h5-query]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "查询 H5 支付订单失败",
      },
      { status: 500 },
    );
  }
}
