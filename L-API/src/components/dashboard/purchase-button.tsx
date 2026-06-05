"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { purchasePackageAction } from "@/server/actions/dashboard";

export function PurchaseButton({
  packageId,
  label,
  variant = "default",
}: {
  packageId: string;
  label: string;
  variant?: "default" | "outline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    const res = await purchasePackageAction(packageId);
    setLoading(false);
    if (res.ok) {
      toast.success(`购买成功，到账 ${res.data?.credits ?? 0} 积分`);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Button onClick={buy} disabled={loading} variant={variant} className="w-full">
      {loading ? <Loader2 className="animate-spin" /> : null}
      {label}
    </Button>
  );
}
