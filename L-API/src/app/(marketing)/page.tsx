import { ArrowRight, Gauge, KeyRound, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { ApiGrid } from "@/components/marketing/api-grid";
import { DemoCard } from "@/components/marketing/demo-card";
import { buttonVariants } from "@/components/ui/button";
import { toApiListItem } from "@/lib/api-view";
import { formatNumber } from "@/lib/format";
import { safe } from "@/lib/safe";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getPlatformStats, listApis, listCategories } from "@/server/services/apis";

export const revalidate = 300;

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

const features = [
  { icon: Zap, title: "极速响应", desc: "全球边缘加速，毫秒级返回，稳定可靠。" },
  { icon: ShieldCheck, title: "安全可信", desc: "密钥鉴权与用量隔离，调用全程可审计。" },
  { icon: Gauge, title: "用量透明", desc: "实时统计请求、延迟与积分消耗。" },
  { icon: KeyRound, title: "开箱即用", desc: "注册即得密钥，三行代码完成接入。" },
];

export default async function HomePage() {
  const [stats, apis, categories] = await Promise.all([
    safe(() => getPlatformStats(), { totalApis: 0, totalCalls: 0, totalCategories: 0 }),
    safe(() => listApis(), []),
    safe(() => listCategories(), []),
  ]);

  const items = apis.map(toApiListItem);
  const categoryOptions = categories.map((c) => ({ slug: c.slug, name: c.name }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "zh-CN",
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/apis?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-3.5" />
              免费、稳定、快速的公共 API 平台
            </span>
            <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              一个接口，连接
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                {" "}
                无限可能
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
              {siteConfig.name} 提供开箱即用的公共 API 与在线工具。极简接入、用量透明，
              为开发者与创作者提供轻巧可靠的接口能力。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/apis"
                className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 px-6 text-base")}
              >
                浏览全部 API
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-6 text-base",
                )}
              >
                免费注册领积分
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              已累计处理{" "}
              <span className="font-semibold text-foreground">
                {compact.format(stats.totalCalls)}
              </span>{" "}
              次接口请求 · 覆盖{" "}
              <span className="font-semibold text-foreground">{stats.totalApis}</span> 个接口
            </p>
          </div>

          {/* 演示卡 */}
          <div className="mx-auto mt-14 max-w-2xl">
            <DemoCard
              slug="translate"
              fields={[
                { name: "text", type: "string", required: true, description: "待翻译文本" },
                {
                  name: "to",
                  type: "string",
                  required: false,
                  description: "目标语言，如 zh / en",
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* 特性 */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* API 网格 */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">全部接口</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              共 {formatNumber(items.length)} 个接口，开箱即用
            </p>
          </div>
          <Link
            href="/apis"
            className="text-sm font-medium text-primary transition-colors hover:underline"
          >
            查看完整列表 →
          </Link>
        </div>
        <ApiGrid items={items} categories={categoryOptions} />
      </section>
    </>
  );
}
