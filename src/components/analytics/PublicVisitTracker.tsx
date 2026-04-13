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
  return true;
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

    const initVisits: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    };

    const initStats: RequestInit = {
      method: "POST",
      keepalive: true,
    };

    void Promise.all([
      fetch(apiUrl("/api/visits"), initVisits).catch(() => {}),
      fetch(apiUrl("/api/statistics/visit"), initStats).catch(() => {}),
    ]);
  }, [pathname]);

  return null;
}
