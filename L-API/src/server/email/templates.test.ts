import { describe, expect, it } from "vitest";
import { receiptEmail, welcomeEmail } from "@/server/email/templates";

describe("email templates", () => {
  it("welcomeEmail includes the name and dashboard link", () => {
    const t = welcomeEmail("张三");
    expect(t.subject).toContain("欢迎");
    expect(t.html).toContain("张三");
    expect(t.html).toContain("/dashboard");
  });

  it("receiptEmail shows credits and formatted amount", () => {
    const t = receiptEmail({
      name: "李四",
      packageName: "进阶包",
      credits: 5000,
      amountCents: 3900,
    });
    expect(t.html).toContain("进阶包");
    expect(t.html).toContain("+5000");
    expect(t.html).toContain("¥39");
  });
});
