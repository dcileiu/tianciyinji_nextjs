"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function H5PayResultContent() {
  const searchParams = useSearchParams();
  const outTradeNo = searchParams.get("outTradeNo") || "";

  async function copyOutTradeNo() {
    if (!outTradeNo) return;
    try {
      await navigator.clipboard.writeText(outTradeNo);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white/90 p-8 text-center shadow">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">已返回支付页</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          微信 H5 支付结果以回调和查单为准。支付成功后请添加客服微信 xy020477，备注「API」获取密钥。
        </p>

        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left">
          <p className="text-xs text-zinc-500">商户订单号</p>
          <p className="mt-1 break-all text-sm font-medium text-zinc-900">
            {outTradeNo || "未获取到订单号"}
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={copyOutTradeNo}
            disabled={!outTradeNo}
            className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            复制订单号
          </button>
          <Link
            href="/api-pricing"
            className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            返回价格页
          </Link>
        </div>
      </div>
    </div>
  );
}
