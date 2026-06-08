import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export interface EmailTemplate {
  subject: string;
  html: string;
}

function shell(title: string, body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
  <h1 style="font-size:18px;margin:0 0 16px">${title}</h1>
  ${body}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
  <p style="font-size:12px;color:#9ca3af">${siteConfig.name} · 此邮件由系统自动发送</p>
</div>`;
}

export function welcomeEmail(name?: string): EmailTemplate {
  return {
    subject: `欢迎加入 ${siteConfig.name}`,
    html: shell(
      `你好${name ? `，${name}` : ""}`,
      `<p style="font-size:14px;line-height:1.7">欢迎注册 ${siteConfig.name}。你已获得新手赠送积分，可前往控制台创建 API 密钥并开始调用接口。</p>
      <p style="font-size:14px"><a href="${siteConfig.url}/dashboard" style="color:#7c3aed">进入控制台 →</a></p>`,
    ),
  };
}

export function receiptEmail(opts: {
  name?: string;
  packageName: string;
  credits: number;
  amountCents: number;
}): EmailTemplate {
  return {
    subject: `${siteConfig.name} 购买成功`,
    html: shell(
      "购买成功",
      `<p style="font-size:14px;line-height:1.7">你好${opts.name ? `，${opts.name}` : ""}，已成功购买「${opts.packageName}」。</p>
      <table style="font-size:14px;width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#6b7280">到账积分</td><td style="text-align:right">+${opts.credits}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280">支付金额</td><td style="text-align:right">${formatPrice(opts.amountCents)}</td></tr>
      </table>
      <p style="font-size:14px"><a href="${siteConfig.url}/dashboard/billing" style="color:#7c3aed">查看账单 →</a></p>`,
    ),
  };
}
