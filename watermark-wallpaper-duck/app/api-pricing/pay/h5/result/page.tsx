import { Suspense } from "react";
import H5PayResultContent from "./H5PayResultContent";

export default function H5PayResultPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-zinc-500">加载中...</div>
      }
    >
      <H5PayResultContent />
    </Suspense>
  );
}
