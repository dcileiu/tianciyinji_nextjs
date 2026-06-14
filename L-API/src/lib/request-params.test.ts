import { describe, expect, it } from "vitest";
import { readRequestParams } from "@/lib/request-params";

const URL_BASE = "https://api.test/api/v1/demo";

describe("readRequestParams", () => {
  it("returns only query params for GET", async () => {
    const req = new Request(`${URL_BASE}?a=1&b=2`);
    const params = await readRequestParams(req);
    expect(params.get("a")).toBe("1");
    expect(params.get("b")).toBe("2");
  });

  it("merges JSON body into query for POST (body overrides)", async () => {
    const req = new Request(`${URL_BASE}?a=1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ a: "override", question: "你好", nested: { x: 1 } }),
    });
    const params = await readRequestParams(req);
    expect(params.get("a")).toBe("override");
    expect(params.get("question")).toBe("你好");
    expect(params.get("nested")).toBe('{"x":1}');
  });

  it("parses urlencoded body for POST", async () => {
    const req = new Request(URL_BASE, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "text=hello&count=3",
    });
    const params = await readRequestParams(req);
    expect(params.get("text")).toBe("hello");
    expect(params.get("count")).toBe("3");
  });

  it("falls back to query when JSON body is invalid", async () => {
    const req = new Request(`${URL_BASE}?a=1`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    const params = await readRequestParams(req);
    expect(params.get("a")).toBe("1");
  });
});
