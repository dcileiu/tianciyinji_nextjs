import type { Metadata } from "next";
import { KeysManager } from "@/components/dashboard/keys-manager";
import { PageHeading } from "@/components/dashboard/page-heading";
import { listKeys } from "@/server/services/keys";
import { requireUser } from "@/server/services/user";

export const metadata: Metadata = { title: "API 密钥" };

export default async function KeysPage() {
  const user = await requireUser();
  const keys = await listKeys(user.id);

  const items = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    status: k.status,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
  }));

  return (
    <div>
      <PageHeading title="API 密钥" description="创建并管理用于调用接口的密钥。" />
      <KeysManager keys={items} />
    </div>
  );
}
