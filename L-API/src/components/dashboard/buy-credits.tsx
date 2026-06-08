"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderStatusAction, startCheckoutAction } from "@/server/actions/dashboard";

export type PaymentMethod = "alipay" | "wechat";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  alipay: "支付宝",
  wechat: "微信支付",
};

export function BuyCredits({
  packageId,
  priceCents,
  methods,
  popular,
}: {
  packageId: string;
  priceCents: number;
  methods: PaymentMethod[];
  popular?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PaymentMethod | "free" | null>(null);
  const [qr, setQr] = useState<{ dataUrl: string; orderId: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFree = priceCents === 0;
  const showMethods = !isFree && methods.length > 0;

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => stopPolling, []);

  async function handle(method?: PaymentMethod) {
    setPending(method ?? "free");
    const res = await startCheckoutAction(packageId, method);
    setPending(null);

    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (res.kind === "credited") {
      toast.success(`到账 ${res.credits} 积分`);
      router.refresh();
      return;
    }
    if (res.kind === "redirect") {
      window.location.href = res.url;
      return;
    }
    // 微信扫码
    setQr({ dataUrl: res.qrDataUrl, orderId: res.orderId });
    startPolling(res.orderId);
  }

  function startPolling(orderId: string) {
    stopPolling();
    const startedAt = Date.now();
    pollRef.current = setInterval(async () => {
      if (Date.now() - startedAt > 5 * 60_000) {
        stopPolling();
        return;
      }
      const { status } = await orderStatusAction(orderId);
      if (status === "PAID") {
        stopPolling();
        setQr(null);
        toast.success("支付成功，积分已到账");
        router.refresh();
      }
    }, 2500);
  }

  if (showMethods) {
    return (
      <>
        <div className="flex flex-col gap-2">
          {methods.map((m) => (
            <Button
              key={m}
              variant={m === "alipay" && popular ? "default" : "outline"}
              className="w-full"
              disabled={pending !== null}
              onClick={() => handle(m)}
            >
              {pending === m ? <Loader2 className="animate-spin" /> : null}
              {METHOD_LABEL[m]}
            </Button>
          ))}
        </div>

        <Dialog
          open={qr !== null}
          onOpenChange={(open) => {
            if (!open) {
              stopPolling();
              setQr(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-xs">
            <DialogHeader>
              <DialogTitle>微信扫码支付</DialogTitle>
              <DialogDescription>
                请使用微信扫描二维码完成支付，支付后将自动到账。
              </DialogDescription>
            </DialogHeader>
            {qr && (
              // 二维码为本地生成的 data URL
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr.dataUrl}
                alt="微信支付二维码"
                className="mx-auto size-56 rounded-lg border border-border/60 bg-white p-2"
              />
            )}
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> 等待支付中…
            </p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 免费领取，或未接入支付（模拟到账）
  return (
    <Button
      variant={popular ? "default" : "outline"}
      className="w-full"
      disabled={pending !== null}
      onClick={() => handle()}
    >
      {pending !== null ? <Loader2 className="animate-spin" /> : null}
      {isFree ? "免费领取" : "购买"}
    </Button>
  );
}
