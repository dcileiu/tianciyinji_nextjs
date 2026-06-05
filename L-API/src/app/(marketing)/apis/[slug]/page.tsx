import { ChevronRight, Coins, ShieldCheck, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoCard } from "@/components/marketing/demo-card";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { methodBadgeClass, parseApiParams, STATUS_LABELS } from "@/lib/api-view";
import { formatNumber } from "@/lib/format";
import { safe } from "@/lib/safe";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { getApiBySlug } from "@/server/services/apis";
import { loadPolicies } from "@/server/security/settings";

export const revalidate = 300;

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

export default async function ApiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const api = await safe(() => getApiBySlug(slug), null);
  if (!api) notFound();

  const policies = await loadPolicies();
  const apiParams = parseApiParams(api.params);
  const query = apiParams
    .map((p) => `${p.name}=${encodeURIComponent(p.name in DEMO ? DEMO[p.name] : "value")}`)
    .join("&");
  const endpoint = `${siteConfig.url}/api/v1/${api.slug}${query ? `?${query}` : ""}`;

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
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        // biome-ignore lint: structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/apis" className="transition-colors hover:text-foreground">
          API 列表
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{api.name}</span>
      </nav>

      <header className="mt-5 border-b border-border/60 pb-7">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-md px-2 py-0.5 font-mono text-xs font-semibold",
              methodBadgeClass(api.method),
            )}
          >
            {api.method}
          </span>
          <span className="text-sm text-muted-foreground">{api.category.name}</span>
          <Badge variant={api.status === "ACTIVE" ? "secondary" : "outline"}>
            {STATUS_LABELS[api.status]}
          </Badge>
        </div>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight">{api.name}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{api.summary}</p>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-4" /> {formatNumber(api.popularity)} 次调用
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Coins className="size-4" /> {api.pricePerCall} 积分/次
          </span>
        </div>
      </header>

      <div className="grid gap-10 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {api.description && (
            <section>
              <h2 className="font-heading text-lg font-semibold">接口说明</h2>
              <p className="mt-2 leading-7 text-muted-foreground">{api.description}</p>
            </section>
          )}

          <section>
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
                            <span className="text-destructive">是</span>
                          ) : (
                            <span className="text-muted-foreground">否</span>
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

          <section className="space-y-4">
            <h2 className="font-heading text-lg font-semibold">调用示例</h2>
            <CodeBlock label="cURL" code={curl} />
            <CodeBlock label="JavaScript" code={jsExample} />
          </section>

          {api.sampleResponse != null && (
            <section>
              <h2 className="font-heading text-lg font-semibold">响应示例</h2>
              <CodeBlock label="JSON" code={JSON.stringify(api.sampleResponse, null, 2)} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <h2 className="mb-3 font-heading text-lg font-semibold">在线调试</h2>
            <DemoCard slug={api.slug} method={api.method} fields={apiParams} />
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> 调用限制
            </h3>
            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <dt>单密钥频率</dt>
                <dd className="font-medium text-foreground">
                  {formatNumber(policies.throughput.apiPerKey.limit)} 次 /{" "}
                  {Math.round(policies.throughput.apiPerKey.windowMs / 1000)} 秒
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>每日配额</dt>
                <dd className="font-medium text-foreground">
                  {formatNumber(policies.throughput.dailyQuota.limit)} 次 / 天
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              超出限制将返回 <code className="font-mono">429</code>，响应头含{" "}
              <code className="font-mono">X-RateLimit-*</code> 与{" "}
              <code className="font-mono">Retry-After</code>。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

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
