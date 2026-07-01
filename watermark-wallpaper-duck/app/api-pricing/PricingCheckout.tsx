"use client";

import { useEffect, useRef, useState } from "react";
import type { PricingPlan } from "@/lib/pricing";
import {
  formatTotal,
  formatUnitPrice,
  PRICING_PLANS,
} from "@/lib/pricing";

type NativeCreateResult = {
  outTradeNo: string;
  qrDataUrl: string;
  amountYuan: string;
  planName: string;
};

const TRADE_STATE_TEXT: Record<string, string> = {
  SUCCESS: "支付成功",
  REFUND: "转入退款",
  NOTPAY: "未支付",
  CLOSED: "已关闭",
  REVOKED: "已撤销",
  USERPAYING: "支付中",
  PAYERROR: "支付失败",
};

async function postJson<T>(url: string, body: Record<string, string>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || `请求失败：HTTP ${response.status}`);
  }
  return data as T & { success: true };
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export default function PricingCheckout() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [buyingPlanId, setBuyingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nativeResult, setNativeResult] = useState<NativeCreateResult | null>(
    null,
  );
  const [tradeState, setTradeState] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const pollTimerRef = useRef<number | null>(null);

  function closeModal() {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setSelectedPlan(null);
    setError("");
    setNativeResult(null);
    setTradeState("");
    setTradeMessage("");
    setLoading(false);
  }

  async function queryOrder(outTradeNo: string) {
    const data = await postJson<{
      tradeState: string;
      tradeStateDesc: string;
      message: string;
    }>("/api/payment/native-query", { outTradeNo });

    setTradeState(data.tradeState);
    setTradeMessage(
      TRADE_STATE_TEXT[data.tradeState] || data.tradeStateDesc || data.message,
    );

    if (data.tradeState === "SUCCESS" && pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }

  function startPolling(outTradeNo: string) {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
    }
    pollTimerRef.current = window.setInterval(() => {
      queryOrder(outTradeNo).catch(() => {});
    }, 2500);
    queryOrder(outTradeNo).catch(() => {});
  }

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  async function createNativeOrder(plan: PricingPlan) {
    try {
      setLoading(true);
      setError("");
      setNativeResult(null);
      setTradeState("");
      setTradeMessage("");

      const data = await postJson<NativeCreateResult>(
        "/api/payment/native-create",
        { planId: plan.id },
      );
      setNativeResult(data);
      startPolling(data.outTradeNo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建扫码支付失败");
    } finally {
      setLoading(false);
    }
  }

  async function createH5Order(plan: PricingPlan) {
    try {
      setBuyingPlanId(plan.id);
      setError("");

      const data = await postJson<{ h5Url: string }>("/api/payment/h5-create", {
        planId: plan.id,
      });
      window.location.href = data.h5Url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建 H5 支付失败");
      setBuyingPlanId(null);
    }
  }

  async function handleBuy(plan: PricingPlan) {
    if (plan.free) return;

    if (isMobileDevice()) {
      await createH5Order(plan);
      return;
    }

    setSelectedPlan(plan);
    await createNativeOrder(plan);
  }

  return (
    <>
      <div className="mt-10 overflow-x-auto rounded-2xl bg-white/90 shadow">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
              <th className="px-6 py-4 font-medium">项目名称</th>
              <th className="px-6 py-4 font-medium">数量（次）</th>
              <th className="px-6 py-4 font-medium">单价（元/次）</th>
              <th className="px-6 py-4 font-medium">合计金额（元）</th>
              <th className="px-6 py-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {PRICING_PLANS.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 last:border-b-0"
              >
                <td className="px-6 py-4 font-medium text-zinc-900">
                  {row.name}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {row.quantity.toLocaleString("zh-CN")}
                </td>
                <td className="px-6 py-4 text-zinc-700">
                  {formatUnitPrice(row.unitPrice)}
                </td>
                <td className="px-6 py-4 text-zinc-900">
                  {row.free && row.total !== null ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-zinc-400 line-through">
                        {formatTotal(row.total)}
                      </span>
                      <span className="font-medium text-blue-600">
                        免费使用
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium">
                      {formatTotal(row.total ?? 0)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {row.free ? (
                    <span className="text-zinc-400">无需支付</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuy(row)}
                      disabled={buyingPlanId === row.id}
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {buyingPlanId === row.id ? "跳转中..." : "立即购买"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && !selectedPlan && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">
                  购买 {selectedPlan.name}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  支付金额 ¥{formatTotal(selectedPlan.total ?? 0)}，请使用微信扫一扫完成支付
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-600"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading && (
              <div className="mt-8 flex flex-col items-center py-6 text-sm text-zinc-500">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                正在生成支付二维码...
              </div>
            )}

            {nativeResult && (
              <div className="mt-5 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nativeResult.qrDataUrl}
                  alt="微信支付二维码"
                  className="mx-auto h-60 w-60 rounded-xl border border-zinc-100 bg-white p-2"
                />
                <p className="mt-3 text-sm text-zinc-600">
                  请使用微信扫一扫完成支付
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  订单号：{nativeResult.outTradeNo}
                </p>
                {tradeMessage && (
                  <p
                    className={`mt-3 text-sm font-medium ${
                      tradeState === "SUCCESS"
                        ? "text-green-600"
                        : "text-zinc-600"
                    }`}
                  >
                    {tradeMessage}
                  </p>
                )}
                {tradeState === "SUCCESS" && (
                  <p className="mt-2 text-sm text-zinc-500">
                    支付成功后请添加客服微信 xy020477，备注「API」获取密钥。
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
