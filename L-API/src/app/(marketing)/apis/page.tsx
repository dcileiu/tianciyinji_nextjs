import type { Metadata } from "next";
import { ApiGrid } from "@/components/marketing/api-grid";
import { toApiListItem } from "@/lib/api-view";
import { safe } from "@/lib/safe";
import { listApis, listCategories } from "@/server/services/apis";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "API 列表",
  description: "浏览 L-API 提供的全部公共 API，按分类筛选与搜索，查看文档与在线调试。",
  alternates: { canonical: "/apis" },
};

export default async function ApisPage() {
  const [apis, categories] = await Promise.all([
    safe(() => listApis(), []),
    safe(() => listCategories(), []),
  ]);

  const items = apis.map(toApiListItem);
  const categoryOptions = categories.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">API 列表</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          覆盖数据查询、开发工具、多媒体与生活服务，开箱即用，按需付费。
        </p>
      </header>
      <ApiGrid items={items} categories={categoryOptions} />
    </div>
  );
}
