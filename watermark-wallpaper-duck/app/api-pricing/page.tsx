import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API接口价格 - 去水印壁纸鸭",
  description:
    "去水印壁纸鸭 API 接口价格方案，支持公众号、抖音、小红书、快手等平台的视频/图片去水印解析。联系客服微信 xy020477 开通。",
};

type Plan = {
  name: string;
  price: string;
  unit: string;
  calls: string;
  features: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "体验版",
    price: "¥0",
    unit: "/ 100 次",
    calls: "100 次额度",
    features: ["全平台解析", "高清无水印", "适合接入测试"],
  },
  {
    name: "标准版",
    price: "¥99",
    unit: "/ 10,000 次",
    calls: "约 ¥0.0099 / 次",
    features: ["全平台解析", "高清无水印", "并发更高", "技术支持"],
    highlight: true,
  },
  {
    name: "企业版",
    price: "¥899",
    unit: "/ 100,000 次",
    calls: "约 ¥0.009 / 次",
    features: ["全平台解析", "高清无水印", "高并发专线", "专属客服支持"],
  },
];

function Nav() {
  return (
    <header className="w-full border-b border-transparent py-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/90 rounded-full overflow-hidden flex items-center justify-center shadow">
            <Image
              src="https://wallpaper.cdn.itianci.cn/wallpaper-wx/duck.webp"
              alt="logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-semibold">去水印壁纸鸭</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-zinc-600">
          <Link className="hover:text-zinc-900" href="/">
            首页
          </Link>
          <Link className="hover:text-zinc-900" href="/">
            使用手册
          </Link>
          <Link className="text-zinc-900 font-medium" href="/api-pricing">
            API接口
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function ApiPricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <Nav />

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-6 pt-12">
          <h1 className="text-3xl font-bold text-center">API接口价格</h1>
          <p className="text-center text-zinc-600 mt-2">
            提供公众号、抖音、小红书、快手等平台的视频/图片去水印解析 API，按调用量计费，简单接入。
          </p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 shadow ${
                  plan.highlight
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white/90"
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span
                    className={`text-sm mb-1 ${
                      plan.highlight ? "text-blue-100" : "text-zinc-500"
                    }`}
                  >
                    {plan.unit}
                  </span>
                </div>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlight ? "text-blue-100" : "text-zinc-500"
                  }`}
                >
                  {plan.calls}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span
                        className={
                          plan.highlight ? "text-blue-100" : "text-blue-600"
                        }
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-12 mb-24">
          <div className="rounded-2xl bg-white/90 shadow p-8 text-center">
            <h2 className="text-xl font-bold">开通 / 咨询 API 接入</h2>
            <p className="text-zinc-600 mt-2">
              如需开通 API 或了解更多定制方案，请联系客服微信：
            </p>
            <p className="mt-4 inline-block rounded-full bg-blue-50 px-6 py-3 text-lg font-semibold text-blue-700">
              微信号：xy020477
            </p>
            <p className="text-sm text-zinc-500 mt-4">
              添加时请备注「API接入」，我们会尽快与您联系。
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
