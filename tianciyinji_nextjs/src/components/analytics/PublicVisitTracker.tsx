"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiUrl } from "@/lib/api-url";

/** 抵消 React Strict Mode 下对同一路径的瞬时重复 effect（开发环境） */
const recentByPath = new Map<string, number>();
const DEDUPE_MS = 500;

function shouldSend(path: string): boolean {
  const now = Date.now();
  const prev = recentByPath.get(path);
  if (prev !== undefined && now - prev < DEDUPE_MS) return false;
  recentByPath.set(path, now);
  return true;
}

function isPublicPath(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  return true;
}

/** 优先使用 sendBeacon（页面卸载/切路由时不会被中断），不可用时回退 keepalive fetch */
function postBeacon(url: string, body?: BodyInit | null): void {
  try {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.sendBeacon === "function"
    ) {
      const blob =
        typeof body === "string"
          ? new Blob([body], { type: "application/json" })
          : body ?? undefined;
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fallthrough */
  }
  void fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ?? undefined,
    keepalive: true,
  }).catch(() => {});
}

export default function PublicVisitTracker() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    if (!isPublicPath(pathname)) return;
    if (!shouldSend(pathname)) return;

    const payload = JSON.stringify({
      path: pathname,
      referer:
        typeof document !== "undefined" && document.referrer
          ? document.referrer
          : undefined,
    });

    postBeacon(apiUrl("/api/visits"), payload);
    postBeacon(apiUrl("/api/statistics/visit"));
  }, [pathname]);

  return null;
}
