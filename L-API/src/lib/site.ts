import { env } from "@/lib/env";

export const siteConfig = {
  name: "L-API",
  title: "L-API · 免费、稳定、快速的公共 API 平台",
  description:
    "L-API 提供免费、稳定、快速的公共 API 服务与在线工具。极简接入、开箱即用,为开发者与创作者提供轻巧可靠的接口能力。",
  url: env.NEXT_PUBLIC_APP_URL,
  keywords: ["API 平台", "公共 API", "免费 API", "开放接口", "API 文档", "在线工具", "开发者工具"],
} as const;

export const mainNav = [
  { title: "API 列表", href: "/apis" },
  { title: "在线工具", href: "/tools" },
  { title: "价格", href: "/pricing" },
  { title: "每日热榜", href: "/hot" },
] as const;

export function pageTitle(title: string) {
  return `${title} · ${siteConfig.name}`;
}
