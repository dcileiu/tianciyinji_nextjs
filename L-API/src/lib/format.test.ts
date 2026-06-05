import { describe, expect, it } from "vitest";
import { formatNumber, formatPrice } from "@/lib/format";

describe("format", () => {
  it("formatNumber groups thousands", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("formatPrice shows 免费 for zero", () => {
    expect(formatPrice(0)).toBe("免费");
  });

  it("formatPrice converts cents to yuan", () => {
    expect(formatPrice(990)).toBe("¥9.90");
    expect(formatPrice(3900)).toBe("¥39");
  });
});
