import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Footer from "../components/Footer";
import PricingCheckout from "./PricingCheckout";

export const metadata: Metadata = {
  title: "API接口价格 - 去水印壁纸鸭",
  description:
    "去水印壁纸鸭 API 接口价格方案，支持公众号、抖音、小红书、快手、哔哩哔哩等平台的视频/图片去水印解析。支持微信扫码支付。",
  alternates: {
    canonical: "/api-pricing",
  },
};

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
            API，按调用量计费，支持微信扫码支付。
          </p>

          <PricingCheckout />
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-12 mb-24">
          <div className="rounded-2xl bg-white/90 shadow p-8 text-center">
            <h2 className="text-xl font-bold">支付后如何开通 API？</h2>
            <p className="text-zinc-600 mt-2">
              支付成功后，请添加客服微信，我们会为您开通 API Key：
            </p>
            <p className="mt-4 inline-block rounded-full bg-blue-50 px-6 py-3 text-lg font-semibold text-blue-700">
              微信号：xy020477
            </p>
            <p className="text-sm text-zinc-500 mt-4">
              添加时请备注「API」，并附上支付订单号，我们会尽快处理。
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
