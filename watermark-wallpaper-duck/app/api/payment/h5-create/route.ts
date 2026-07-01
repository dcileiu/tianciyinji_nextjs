import { NextResponse } from "next/server";
import {
  appendH5RedirectUrl,
  buildH5OrderPayload,
  formatFenAsYuan,
  normalizeClientIp,
} from "@/lib/wechat-pay/paymentHelpers";
import {
  getClientIp,
  getH5AppUrl,
  getH5NotifyUrl,
  getH5RedirectUrl,
} from "@/lib/wechat-pay/requestUtils";
import { getPayConfig, randomStr, wechatPayRequest } from "@/lib/wechat-pay/wechatPay";
import { planDescription, PRICING_PLANS } from "@/lib/pricing";

function buildOutTradeNo(planId: string) {
  const ts = Date.now();
  const suffix = randomStr(6).toUpperCase();
  return `H5${planId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}${ts}${suffix}`;
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
    const clientIp = normalizeClientIp(getClientIp(request));
    const appUrl = getH5AppUrl(request);
    const notifyUrl = getH5NotifyUrl(request);
    const redirectUrl = getH5RedirectUrl(request, outTradeNo);
    const payload = buildH5OrderPayload({
      appid,
      mchid,
      notifyUrl,
      amountFen,
      clientIp,
      appUrl,
      outTradeNo,
      description: planDescription(plan),
    });

    const data = (await wechatPayRequest({
      method: "POST",
      canonicalUrl: "/v3/pay/transactions/h5",
      body: JSON.stringify(payload),
    })) as { h5_url?: string };

    if (!data?.h5_url) {
      throw new Error("微信返回 h5_url 为空");
    }

    const h5Url = appendH5RedirectUrl({
      h5Url: data.h5_url,
      redirectUrl,
    });

    return NextResponse.json({
      success: true,
      outTradeNo,
      h5Url,
      planId: plan.id,
      planName: plan.name,
      amountFen,
      amountYuan: formatFenAsYuan(amountFen),
      redirectUrl,
    });
  } catch (error) {
    console.error("[payment/h5-create]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "创建 H5 支付订单失败",
      },
      { status: 500 },
    );
  }
}
