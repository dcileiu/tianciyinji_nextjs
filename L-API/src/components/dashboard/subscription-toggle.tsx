"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleHotSubscriptionAction } from "@/server/actions/dashboard";

export function SubscriptionToggle({ initialSubscribed }: { initialSubscribed: boolean }) {
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await toggleHotSubscriptionAction();
    setLoading(false);
    if (res.ok) {
      const next = res.data?.subscribed ?? !subscribed;
      setSubscribed(next);
      toast.success(next ? "已订阅每日热榜" : "已取消订阅");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Button onClick={toggle} disabled={loading} variant={subscribed ? "outline" : "default"}>
      {loading ? <Loader2 className="animate-spin" /> : subscribed ? <BellOff /> : <Bell />}
      {subscribed ? "取消订阅" : "订阅热榜"}
    </Button>
  );
}
