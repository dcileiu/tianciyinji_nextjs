import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "服务条款 - 去水印壁纸鸭",
  description:
    "去水印壁纸鸭服务条款，包含条款接受、服务说明、版权声明、用户责任、知识产权及服务限制等内容。",
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

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <Nav />

      <main className="flex-1 w-full">
        <section className="max-w-4xl mx-auto px-6 pt-12 pb-16">
          <h1 className="text-3xl font-bold">服务条款</h1>

          <div className="mt-8 space-y-8 leading-relaxed text-zinc-600">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">条款接受</h2>
              <p className="mt-3">
                访问和使用去水印壁纸鸭即表示您同意受本服务条款的约束。如果您不同意这些条款，请勿使用我们的去水印服务。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">服务说明</h2>
              <p className="mt-3">
                去水印壁纸鸭提供专业的视频和图片去水印服务，支持多个社交媒体平台。我们的服务包括：
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>小红书、抖音、快手等平台视频去水印下载</li>
                <li>支持图片去水印下载和保存</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">版权声明</h2>
              <p className="mt-3">
                所有通过本服务处理的视频、图片等内容的知识产权均归原平台及内容创作者所有。去水印壁纸鸭仅提供去水印技术服务，不存储任何视频及图片内容，也不对内容的版权负责。用户在使用本服务时，必须遵守相关平台的服务条款和版权规定。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">用户责任</h2>
              <p className="mt-3">
                您同意仅将我们的去水印服务用于个人用途，并遵守相关平台的服务条款。您负责确保您有权下载和修改通过我们服务处理的内容，不得用于商业用途或侵犯他人知识产权。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">知识产权</h2>
              <p className="mt-3">
                您保留原始内容的所有权利。通过使用我们的去水印服务，您授予我们临时的处理权限，仅用于提供去水印服务的目的。我们不会存储或传播您的内容，所有处理都是实时进行的。
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-zinc-900">服务限制</h2>
              <p className="mt-3">
                我们保留在以下情况下限制、暂停或终止服务的权利：滥用服务、违反条款、影响其他用户使用等。我们不保证服务完全无中断，但会尽力提供稳定可靠的服务。
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
