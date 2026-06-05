import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/ip";

function headers(init: Record<string, string>): Headers {
  return new Headers(init);
}

describe("getClientIp", () => {
  it("returns first ip from x-forwarded-for", () => {
    expect(getClientIp(headers({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
  });

  it("falls back to x-real-ip", () => {
    expect(getClientIp(headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3");
  });

  it("returns placeholder when nothing present", () => {
    expect(getClientIp(headers({}))).toBe("0.0.0.0");
    expect(getClientIp(null)).toBe("0.0.0.0");
  });
});
