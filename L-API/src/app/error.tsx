"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { captureError } from "@/lib/observability";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: "global", digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-2xl font-bold tracking-tight">出错了</h1>
      <p className="max-w-sm text-muted-foreground">页面加载发生错误，请稍后重试。</p>
      <Button onClick={reset}>重试</Button>
    </div>
  );
}
