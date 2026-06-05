"use server";

import { headers } from "next/headers";
import { getClientIp } from "@/lib/ip";
import { ApiInputError, runApi } from "@/server/api-runtime";
import { rateLimit } from "@/server/security";

export type DemoResult = { ok: true; data: unknown } | { ok: false; error: string };

/** 公共演示调用：不校验密钥、不计费，仅用于站点交互演示（按 IP 限流防滥用）。 */
export async function runDemo(slug: string, params: Record<string, string>): Promise<DemoResult> {
  const ip = getClientIp(await headers());
  const rl = await rateLimit("demoPerIp", ip);
  if (!rl.success) {
    return { ok: false, error: "演示调用过于频繁，请稍后再试" };
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }

  try {
    const data = await runApi(slug, search);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiInputError) return { ok: false, error: err.message };
    return { ok: false, error: "演示调用失败" };
  }
}
