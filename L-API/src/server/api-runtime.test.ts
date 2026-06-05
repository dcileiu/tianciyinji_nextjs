import { describe, expect, it } from "vitest";
import { ApiInputError, runApi } from "@/server/api-runtime";

function params(obj: Record<string, string> = {}): URLSearchParams {
  return new URLSearchParams(obj);
}

describe("runApi", () => {
  it("uuid respects count and caps at 50", async () => {
    const one = (await runApi("uuid", params())) as { uuids: string[] };
    expect(one.uuids).toHaveLength(1);
    const many = (await runApi("uuid", params({ count: "999" }))) as { uuids: string[] };
    expect(many.uuids).toHaveLength(50);
  });

  it("hash-text returns md5/sha1/sha256", async () => {
    const res = (await runApi("hash-text", params({ text: "hello" }))) as Record<string, string>;
    expect(res.md5).toMatch(/^[a-f0-9]{32}$/);
    expect(res.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("throws ApiInputError for missing required param", async () => {
    await expect(runApi("hash-text", params())).rejects.toBeInstanceOf(ApiInputError);
  });

  it("throws ApiInputError for invalid timezone", async () => {
    await expect(runApi("world-time", params({ timezone: "Not/AZone" }))).rejects.toBeInstanceOf(
      ApiInputError,
    );
  });

  it("validates phone format", async () => {
    await expect(runApi("phone-area", params({ phone: "123" }))).rejects.toBeInstanceOf(
      ApiInputError,
    );
  });

  it("password-gen honors length bounds", async () => {
    const res = (await runApi("password-gen", params({ length: "3" }))) as { password: string };
    expect(res.password).toHaveLength(6);
  });
});
