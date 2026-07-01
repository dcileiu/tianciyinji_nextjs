import QRCode from "qrcode";
import { NextResponse } from "next/server";
import {
  buildNativeOrderPayload,
  formatFenAsYuan,
} from "@/lib/wechat-pay/paymentHelpers";
import { getNativeNotifyUrl } from "@/lib/wechat-pay/requestUtils";
import { getPayConfig, randomStr, wechatPayRequest } from "@/lib/wechat-pay/wechatPay";
import { planDescription, PRICING_PLANS } from "@/lib/pricing";

function buildOutTradeNo(planId: string) {
  const ts = Date.now();
  const suffix = randomStr(6).toUpperCase();
  return `NT${planId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}${ts}${suffix}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = String(body?.planId || "").trim();
    const plan = PRICING_PLANS.find((item) => item.id === planId);

    if (!plan || plan.free || !plan.total) {
      return NextResponse.json(
        { success: false, error: "无效的套餐，免费套餐无需支付" },
        { status: 400 },
      );
    }

    const amountFen = Math.round(plan.total * 100);
    if (amountFen < 1) {
      return NextResponse.json(
        { success: false, error: "支付金额无效" },
        { status: 400 },
      );
    }

    const { appid, mchid } = getPayConfig();
    const outTradeNo = buildOutTradeNo(plan.id);
    const notifyUrl = getNativeNotifyUrl(request);
    const payload = buildNativeOrderPayload({
      appid,
      mchid,
      notifyUrl,
      amountFen,
      outTradeNo,
      description: planDescription(plan),
    });

    const data = (await wechatPayRequest({
      method: "POST",
      canonicalUrl: "/v3/pay/transactions/native",
      body: JSON.stringify(payload),
    })) as { code_url?: string };

    if (!data?.code_url) {
      throw new Error("微信返回 code_url 为空");
    }

    const qrDataUrl = await QRCode.toDataURL(data.code_url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 240,
    });

    return NextResponse.json({
      success: true,
      outTradeNo,
      codeUrl: data.code_url,
      qrDataUrl,
      planId: plan.id,
      planName: plan.name,
      amountFen,
      amountYuan: formatFenAsYuan(amountFen),
    });
  } catch (error) {
    console.error("[payment/native-create]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建 Native 支付订单失败",
      },
      { status: 500 },
    );
  }
}
