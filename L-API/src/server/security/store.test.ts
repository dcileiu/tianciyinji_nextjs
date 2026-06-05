import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRateStore } from "@/server/security/store";

describe("MemoryRateStore", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 重置单例，避免用例间互相影响。
    (globalThis as { __lapiRateStore?: unknown }).__lapiRateStore = undefined;
  });
  afterEach(() => {
    vi.useRealTimers();
    (globalThis as { __lapiRateStore?: unknown }).__lapiRateStore = undefined;
  });

  it("increments within a window and resets after it expires", async () => {
    const store = getRateStore();
    const a = await store.hit("k", 1000);
    const b = await store.hit("k", 1000);
    expect(a.count).toBe(1);
    expect(b.count).toBe(2);

    vi.advanceTimersByTime(1001);
    const c = await store.hit("k", 1000);
    expect(c.count).toBe(1);
  });

  it("block / isBlocked / unblock work and expire", async () => {
    const store = getRateStore();
    expect(await store.isBlocked("b")).toBe(false);
    await store.block("b", 1000);
    expect(await store.isBlocked("b")).toBe(true);

    await store.unblock("b");
    expect(await store.isBlocked("b")).toBe(false);

    await store.block("b2", 500);
    vi.advanceTimersByTime(501);
    expect(await store.isBlocked("b2")).toBe(false);
  });
});
