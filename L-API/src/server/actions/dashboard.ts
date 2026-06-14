"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PaymentMethod } from "@/server/payments";
import { type CheckoutResult, getOrderStatus, startCheckout } from "@/server/services/billing";
import { toggleSubscription } from "@/server/services/hot";
import { createKey, revokeKey } from "@/server/services/keys";
import { requireUser } from "@/server/services/user";

export type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

const createKeySchema = z.object({
  name: z.string().trim().max(50).optional().default(""),
  scopes: z.array(z.string().min(1)).optional().default([]),
  expiresInDays: z.number().int().positive().max(3650).nullable().optional(),
  dailyQuota: z.number().int().positive().max(10_000_000).nullable().optional(),
  rateLimitPerMin: z.number().int().positive().max(100_000).nullable().optional(),
});

export type CreateKeyActionInput = z.input<typeof createKeySchema>;

export async function createApiKeyAction(
  input: CreateKeyActionInput,
): Promise<ActionResult<{ key: string }>> {
  const user = await requireUser();
  const parsed = createKeySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "参数有误" };
  }
  const { key } = await createKey(user.id, parsed.data);
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

export async function startCheckoutAction(
  packageId: string,
  method?: PaymentMethod,
): Promise<CheckoutResult> {
  const user = await requireUser();
  const res = await startCheckout(user.id, packageId, method);
  if (res.ok && res.kind === "credited") {
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
  }
  return res;
}

export async function orderStatusAction(orderId: string): Promise<{ status: string | null }> {
  const user = await requireUser();
  const status = await getOrderStatus(user.id, orderId);
  if (status === "PAID") {
    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
  }
  return { status };
}

export async function toggleHotSubscriptionAction(): Promise<
  ActionResult<{ subscribed: boolean }>
> {
  const user = await requireUser();
  const subscribed = await toggleSubscription(user.id);
  revalidatePath("/dashboard/subscriptions");
  return { ok: true, data: { subscribed } };
}
