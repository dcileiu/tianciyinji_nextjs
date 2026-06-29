import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "隐私政策 - 去水印壁纸鸭",
  description:
    "去水印壁纸鸭隐私政策，说明我们如何收集、使用、存储和保护您的信息，以及您所享有的用户权利。",
  alternates: {
    canonical: "/privacy",
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
          <Link className="hover:text-zinc-900" href="/api-pricing">
            API接口
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <Nav />

      <main className="flex-1 w-full">
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-16">
          <h1 className="text-3xl font-bold">隐私政策</h1>

          <div className="mt-8 space-y-8 leading-relaxed text-zinc-600">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">信息收集</h2>
              <p className="mt-3">
                我们仅收集提供服务所必需的最少信息：您需要处理的视频或图片链接。我们不会收集或存储您的个人身份信息，也不会保存您下载的内容。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">信息使用</h2>
              <p className="mt-3">我们使用收集的信息仅用于以下目的：</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>提供去水印和下载服务</li>
                <li>优化服务性能和用户体验</li>
                <li>防止服务滥用和保护系统安全</li>
                <li>改进服务功能和稳定性</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                数据存储和安全
              </h2>
              <p className="mt-3">
                我们采用实时处理方式，不会永久存储您的视频或图片内容。所有处理完成后，相关数据会立即删除。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">第三方服务</h2>
              <p className="mt-3">
                我们的去水印服务可能使用必要的第三方服务来提供技术支持。这些服务商只能访问处理您内容所需的最少信息，并受到严格的保密协议约束。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">用户权利</h2>
              <p className="mt-3">
                您完全控制您的数据：您可以随时停止使用我们的服务，我们不会保留您的任何处理记录。如果您发现任何隐私问题，请立即联系我们处理。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                隐私政策更新
              </h2>
              <p className="mt-3">
                我们可能会根据服务发展更新隐私政策。重要变更会通过网站公告通知。我们建议您定期查看本政策，了解我们如何保护您的隐私。
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
