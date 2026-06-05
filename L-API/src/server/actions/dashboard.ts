"use server";

import { revalidatePath } from "next/cache";
import { purchasePackage } from "@/server/services/billing";
import { toggleSubscription } from "@/server/services/hot";
import { createKey, revokeKey } from "@/server/services/keys";
import { requireUser } from "@/server/services/user";

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

export async function createApiKeyAction(name: string): Promise<ActionResult<{ key: string }>> {
  const user = await requireUser();
  const { key } = await createKey(user.id, name);
  revalidatePath("/dashboard/keys");
  revalidatePath("/dashboard");
  return { ok: true, data: { key } };
}

export async function revokeApiKeyAction(keyId: string): Promise<ActionResult> {
  const user = await requireUser();
  const done = await revokeKey(user.id, keyId);
  if (!done) return { ok: false, error: "密钥不存在或无权操作" };
  revalidatePath("/dashboard/keys");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function purchasePackageAction(
  packageId: string,
): Promise<ActionResult<{ credits: number }>> {
  const user = await requireUser();
  const res = await purchasePackage(user.id, packageId);
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
  return { ok: true, data: { credits: res.credits } };
}

export async function toggleHotSubscriptionAction(): Promise<
  ActionResult<{ subscribed: boolean }>
> {
  const user = await requireUser();
  const subscribed = await toggleSubscription(user.id);
  revalidatePath("/dashboard/subscriptions");
  return { ok: true, data: { subscribed } };
}
