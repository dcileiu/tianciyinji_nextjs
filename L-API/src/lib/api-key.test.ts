import { describe, expect, it } from "vitest";
import { API_KEY_PREFIX, generateApiKey, hashApiKey, maskApiKey } from "@/lib/api-key";

describe("api-key", () => {
  it("hashApiKey is deterministic sha256 hex", () => {
    const h1 = hashApiKey("lapi_abc");
    const h2 = hashApiKey("lapi_abc");
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generateApiKey returns matching prefix and hash", () => {
    const { key, prefix, hash } = generateApiKey();
    expect(key.startsWith(`${API_KEY_PREFIX}_`)).toBe(true);
    expect(prefix).toBe(key.slice(0, 14));
    expect(hash).toBe(hashApiKey(key));
  });

  it("generateApiKey produces unique keys", () => {
    expect(generateApiKey().key).not.toBe(generateApiKey().key);
  });

  it("maskApiKey keeps prefix and masks the rest", () => {
    const masked = maskApiKey("lapi_1234567");
    expect(masked.startsWith("lapi_1234567")).toBe(true);
    expect(masked).toContain("•");
  });
});
