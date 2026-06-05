"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="font-heading text-xl font-bold tracking-tight">加载失败</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        数据加载出现问题，请确认数据库已连接后重试。
      </p>
      <Button onClick={reset}>重试</Button>
    </div>
  );
}
