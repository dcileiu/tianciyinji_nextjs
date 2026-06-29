import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "API接口价格 - 去水印壁纸鸭",
  description:
    "去水印壁纸鸭 API 接口价格方案，支持公众号、抖音、小红书、快手、哔哩哔哩等平台的视频/图片去水印解析。联系客服微信 xy020477 开通。",
  alternates: {
    canonical: "/api-pricing",
  },
};

type PricingRow = {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number | null;
  free?: boolean;
};

const PRICING_ROWS: PricingRow[] = [
  { name: "100次", quantity: 100, unitPrice: 0.02, total: 2, free: true },
  { name: "2500次", quantity: 2500, unitPrice: 0.00396, total: 9.9 },
  { name: "5000次", quantity: 5000, unitPrice: 0.0036, total: 18 },
  { name: "7500次", quantity: 7500, unitPrice: 0.00333, total: 25 },
  { name: "1万次", quantity: 10000, unitPrice: 0.003, total: 30 },
];

function formatUnitPrice(value: number) {
  return value.toFixed(4);
}

function formatTotal(value: number) {
  return value.toFixed(2);
}

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
            提供公众号、抖音、小红书、快手、哔哩哔哩等平台的视频/图片去水印解析
            API，按调用量计费，简单接入。
          </p>

          <div className="mt-10 overflow-x-auto rounded-2xl bg-white/90 shadow">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
                  <th className="px-6 py-4 font-medium">项目名称</th>
                  <th className="px-6 py-4 font-medium">数量（次）</th>
                  <th className="px-6 py-4 font-medium">单价（元/次）</th>
                  <th className="px-6 py-4 font-medium">合计金额（元）</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_ROWS.map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-zinc-100 last:border-b-0"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-4 text-zinc-700">
                      {row.quantity.toLocaleString("zh-CN")}
                    </td>
                    <td className="px-6 py-4 text-zinc-700">
                      {formatUnitPrice(row.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-zinc-900">
                      {row.free && row.total !== null ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="text-zinc-400 line-through">
                            {formatTotal(row.total)}
                          </span>
                          <span className="font-medium text-blue-600">
                            免费使用
                          </span>
                        </span>
                      ) : (
                        <span className="font-medium">
                          {formatTotal(row.total ?? 0)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-12 mb-24">
          <div className="rounded-2xl bg-white/90 shadow p-8 text-center">
            <h2 className="text-xl font-bold">
              开通 / 咨询 API 接入 / 定制开发
            </h2>
            <p className="text-zinc-600 mt-2">
              如需开通 API 或了解更多定制方案，请联系客服微信：
            </p>
            <p className="mt-4 inline-block rounded-full bg-blue-50 px-6 py-3 text-lg font-semibold text-blue-700">
              微信号：xy020477
            </p>
            <p className="text-sm text-zinc-500 mt-4">
              添加时请备注「API」，我们会尽快与您联系。
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
