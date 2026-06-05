'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// 背景 canvas 纯装饰（底色由 body::before/::after 的 CSS 即时绘制），
// 因此把它从首屏关键路径里移除：客户端动态加载 + 首屏空闲后再挂载，降低首屏 JS 与主线程占用。
const FabricBackground = dynamic(
  () => import('@/components/FabricBackground').then((m) => m.FabricBackground),
  { ssr: false },
);

export default function FabricBackgroundLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  return ready ? <FabricBackground /> : null;
}
