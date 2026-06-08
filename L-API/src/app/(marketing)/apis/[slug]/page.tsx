import { ChevronRight, Coins, MessageCircleQuestion, ShieldCheck, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiDocSidebar } from "@/components/marketing/api-doc-sidebar";
import { ApiDocToc } from "@/components/marketing/api-doc-toc";
import { ApiTryConsole } from "@/components/marketing/api-try-console";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { parseApiParams, STATUS_LABELS, toApiListItem } from "@/lib/api-view";
import { formatNumber } from "@/lib/format";
import { safe } from "@/lib/safe";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getApiBySlug, listApis } from "@/server/services/apis";
import { loadPolicies } from "@/server/security/settings";

export const revalidate = 300;

const DEMO: Record<string, string> = {
  timezone: "Asia/Shanghai",
  ip: "8.8.8.8",
  city: "上海",
  phone: "13800138000",
  text: "Hello",
  count: "3",
  length: "16",
  qq: "10000",
  room: "1",
  to: "zh",
  seed: "lapi",
};

const TOC = [
  { id: "overview", label: "功能概述" },
  { id: "params", label: "请求参数" },
  { id: "response", label: "响应" },
  { id: "quickstart", label: "快速上手" },
];

export function generateStaticParams() {
  // 运行时按需（ISR）生成，避免构建期依赖数据库。
  return [] as { slug: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const api = await safe(() => getApiBySlug(slug), null);
  if (!api) return { title: "接口不存在" };
  return {
    title: api.name,
    description: api.summary,
    alternates: { canonical: `/apis/${api.slug}` },
    openGraph: { title: `${api.name} · ${siteConfig.name}`, description: api.summary },
  };
}

function domainOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "api";
  }
}

export default async function ApiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [api, allApis, policies] = await Promise.all([
    safe(() => getApiBySlug(slug), null),
    safe(() => listApis(), []),
    loadPolicies(),
  ]);
  if (!api) notFound();

  const navApis = allApis.map(toApiListItem);
  const apiParams = parseApiParams(api.params);
  const path = `/api/v1/${api.slug}`;
  const query = apiParams
    .map((p) => `${p.name}=${encodeURIComponent(p.name in DEMO ? DEMO[p.name] : "value")}`)
    .join("&");
  const endpoint = `${siteConfig.url}${path}${query ? `?${query}` : ""}`;

  const curl = `curl "${endpoint}" \\\n  -H "x-api-key: YOUR_API_KEY"`;
  const jsExample = `const res = await fetch("${endpoint}", {\n  headers: { "x-api-key": "YOUR_API_KEY" },\n});\nconst json = await res.json();`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: api.name,
    description: api.summary,
    inLanguage: "zh-CN",
    url: `${siteConfig.url}/apis/${api.slug}`,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        // biome-ignore lint: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_180px]">
        {/* 左：文档导航 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-8 pr-1">
            <ApiDocSidebar apis={navApis} currentSlug={api.slug} />
          </div>
        </aside>

        {/* 中：内容 */}
        <article className="min-w-0">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/apis" className="transition-colors hover:text-foreground">
              API 列表
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground">{api.name}</span>
          </nav>

          <header className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">{api.category.name}</span>
              <Badge variant={api.status === "ACTIVE" ? "secondary" : "outline"}>
                {STATUS_LABELS[api.status]}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight">{api.name}</h1>
              <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <TrendingUp className="size-4" /> {formatNumber(api.popularity)} 次调用
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Coins className="size-4" /> {api.pricePerCall} 积分/次
                </span>
              </div>
            </div>
            <p className="mt-2 max-w-3xl text-muted-foreground">{api.summary}</p>
          </header>

          {/* Endpoint + 试一试 */}
          <div className="mt-5">
            <ApiTryConsole
              slug={api.slug}
              method={api.method}
              domain={domainOf(siteConfig.url)}
              path={path}
              fields={apiParams}
              defaults={DEMO}
            />
          </div>

          <div className="mt-10 space-y-10">
            <section id="overview" className="scroll-mt-24">
              <h2 className="font-heading text-lg font-semibold">功能概述</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                {api.description || api.summary}
              </p>
            </section>

            <section id="params" className="scroll-mt-24">
              <h2 className="font-heading text-lg font-semibold">请求参数</h2>
              {apiParams.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">该接口无需参数。</p>
              ) : (
                <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2.5 font-medium">参数</th>
                        <th className="px-4 py-2.5 font-medium">类型</th>
                        <th className="px-4 py-2.5 font-medium">必填</th>
                        <th className="px-4 py-2.5 font-medium">说明</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {apiParams.map((p) => (
                        <tr key={p.name}>
                          <td className="px-4 py-2.5 font-mono text-xs">{p.name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{p.type}</td>
                          <td className="px-4 py-2.5">
                            {p.required ? (
                              <span className="text-destructive">必填</span>
                            ) : (
                              <span className="text-muted-foreground">可选</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section id="response" className="scroll-mt-24 space-y-4">
              <h2 className="font-heading text-lg font-semibold">响应</h2>
              <StatusBlock code="200" label="请求成功" tone="ok">
                {api.sampleResponse != null ? (
                  <CodeBlock label="JSON" code={JSON.stringify(api.sampleResponse, null, 2)} />
                ) : (
                  <p className="text-sm text-muted-foreground">成功返回业务数据。</p>
                )}
              </StatusBlock>
              <StatusBlock code="400" label="错误的请求" tone="warn">
                <CodeBlock
                  label="JSON"
                  code={JSON.stringify({ code: 400, message: "请求参数无效" }, null, 2)}
                />
              </StatusBlock>
              <StatusBlock code="429" label="超出频率限制" tone="warn">
                <p className="text-sm text-muted-foreground">
                  触发限流，响应头含 <code className="font-mono">X-RateLimit-*</code> 与{" "}
                  <code className="font-mono">Retry-After</code>。
                </p>
              </StatusBlock>
              <StatusBlock code="500" label="服务器内部错误" tone="error">
                <p className="text-sm text-muted-foreground">服务暂时不可用，请稍后重试。</p>
              </StatusBlock>
            </section>

            <section id="quickstart" className="scroll-mt-24 space-y-4">
              <h2 className="font-heading text-lg font-semibold">快速上手</h2>
              <CodeBlock label="cURL" code={curl} />
              <CodeBlock label="JavaScript" code={jsExample} />
            </section>

            <div className="rounded-xl border border-border/70 bg-card p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <ShieldCheck className="size-4 text-primary" /> 调用限制
              </h3>
              <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4">
                  <dt>单密钥频率</dt>
                  <dd className="font-medium text-foreground">
                    {formatNumber(policies.throughput.apiPerKey.limit)} 次 /{" "}
                    {Math.round(policies.throughput.apiPerKey.windowMs / 1000)} 秒
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>每日配额</dt>
                  <dd className="font-medium text-foreground">
                    {formatNumber(policies.throughput.dailyQuota.limit)} 次 / 天
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </article>

        {/* 右：目录 + 操作 */}
        <aside className="hidden xl:block">
          <div className="sticky top-20 space-y-5">
            <ApiDocToc items={TOC} />
            <div className="space-y-2 pl-4 text-sm">
              <a
                href="mailto:support@l-api.dev"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <MessageCircleQuestion className="size-4" /> 接口有问题？反馈
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Coins className="size-3.5" />{" "}
                {api.pricePerCall === 0 ? "免费" : `${api.pricePerCall} 积分/次`}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatusBlock({
  code,
  label,
  tone,
  children,
}: {
  code: string;
  label: string;
  tone: "ok" | "warn" | "error";
  children: React.ReactNode;
}) {
  const toneClass = {
    ok: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    warn: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
    error: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  }[tone];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={cn("rounded px-1.5 py-0.5 font-mono text-xs font-semibold", toneClass)}>
          {code}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-foreground/[0.02]">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed">{code}</pre>
    </div>
  );
}
