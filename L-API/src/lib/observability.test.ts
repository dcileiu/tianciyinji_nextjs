import { describe, expect, it } from "vitest";
import { parseSentryDsn } from "@/lib/observability";

describe("parseSentryDsn", () => {
  it("parses a standard DSN into the envelope endpoint", () => {
    const dsn = parseSentryDsn("https://abc123@o42.ingest.sentry.io/55");
    expect(dsn).toEqual({
      envelopeUrl: "https://o42.ingest.sentry.io/api/55/envelope/",
      publicKey: "abc123",
      host: "o42.ingest.sentry.io",
      projectId: "55",
    });
  });

  it("returns null for malformed DSN", () => {
    expect(parseSentryDsn("not a url")).toBeNull();
    expect(parseSentryDsn("https://sentry.io/55")).toBeNull(); // 缺少 publicKey
  });
});
