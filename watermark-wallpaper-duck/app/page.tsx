"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function Nav() {
  return (
    <header className="w-full border-b border-transparent py-4">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
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
        </div>
        <div className="flex items-center gap-6 text-sm text-zinc-600">
          <a className="hover:text-zinc-900" href="#">
            首页
          </a>
          <a className="hover:text-zinc-900" href="#">
            使用手册
          </a>
          <Link className="hover:text-zinc-900" href="/api-pricing">
            API接口
          </Link>
          <div className="relative group">
            <span className="cursor-pointer hover:text-zinc-900">
              微信小程序
            </span>
            <div className="absolute right-0 top-full mt-2 z-10 hidden group-hover:block">
              <div className="bg-white rounded-xl p-3 shadow-lg border border-zinc-100">
                <Image
                  src="/icons/qr.jpg"
                  alt="微信小程序物料码"
                  width={480}
                  height={480}
                />
                <p className="text-center text-xs text-zinc-500 mt-2">
                  微信扫码进入小程序
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    downloadUrls?: string[];
    liveUrls?: string[];
  } | null>(null);

  async function handleParse() {
    setError(null);
    setResult(null);
    const trimmed = input.trim();
    if (!trimmed) {
      setError("请输入链接或分享口令");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch("/api/dewatermark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, platform: "unknown" }),
      });
      const data = await resp.json();
      if (!resp.ok || data?.code !== 0)
        throw new Error(data?.error || data?.msg || "解析失败");
      setResult(data.data);
    } catch (err: unknown) {
      let message = String(err ?? "未知错误");
      try {
        if (typeof err === "object" && err !== null && "message" in err) {
          message = String(
            (err as unknown as { message?: unknown }).message ?? message,
          );
        }
      } catch {}
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-grid">
      <Nav />

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-6 pt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 shadow-lg">
            <h1 className="text-3xl font-bold text-center">去水印壁纸鸭</h1>
            <p className="text-center text-zinc-600 mt-2">
              专注于公众号、抖音、小红书、快手四个平台的视频/图片去水印与下载。无需登录，一键解析并保存高清内容。
            </p>

            <div className="mt-8">
              <label className="block text-sm text-zinc-700 mb-2">
                请输入分享URL链接或口令
              </label>
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="请输入平台对应的 URL 地址 ~"
                  className="flex-1 rounded-full border border-zinc-200 px-5 py-3 outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={handleParse}
                  disabled={loading}
                  className="bg-blue-600 text-white rounded-full px-8 py-3"
                >
                  {loading ? "解析中..." : "开始解析"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="mt-4 text-sm text-zinc-500">
                  当前支持的平台：
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                    <Image
                      src="/icons/wx.ico"
                      alt="公众号"
                      width={24}
                      height={24}
                    />
                    <span className="text-sm">公众号</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                    <Image
                      src="/icons/dy.png"
                      alt="抖音"
                      width={24}
                      height={24}
                    />
                    <span className="text-sm">抖音</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                    <Image
                      src="/icons/xhs.ico"
                      alt="小红书"
                      width={24}
                      height={24}
                    />
                    <span className="text-sm">小红书</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                    <Image
                      src="/icons/ks.ico"
                      alt="快手"
                      width={24}
                      height={24}
                    />
                    <span className="text-sm">快手</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center items-center gap-5 text-sm text-zinc-600">
                <a
                  href="https://itianci.cn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 1024 1024"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M939.74 803.39C914.88 666 821.06 552.51 695.48 500.05a241.61 241.61 0 0 0 85.34-184.54c0-133.78-108.39-242.17-242.17-242.17S296.48 181.73 296.48 315.51A241.6 241.6 0 0 0 381.75 500c-125.63 52.42-219.47 165.9-244.42 303.28-6.84 38.24 22.25 73.36 61.07 73.36l680.26 0.12a62.15 62.15 0 0 0 61.08-73.37zM538.65 180.26c74.58 0 135.25 60.68 135.25 135.25s-60.67 135.25-135.25 135.25S403.4 390.09 403.4 315.51s60.68-135.25 135.25-135.25zM237.34 783.92a316.7 316.7 0 0 1 98.27-148.34 314.26 314.26 0 0 1 405.84 0A315.89 315.89 0 0 1 839.73 784z" />
                    <path d="M467.04 676.55h143.01q35.75 0 35.75 35.75t-35.75 35.75H467.04q-35.75 0-35.75-35.75t35.75-35.75z" />
                  </svg>
                  关于作者
                </a>
                <span className="h-4 w-px bg-zinc-300" />
                <a
                  href="#"
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  搭建同款站点+微信:xy020477
                </a>
                <span className="h-4 w-px bg-zinc-300" />
                <a
                  href="#"
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 1024 1024"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M512 106.667A405.333 405.333 0 1 0 917.333 512 405.333 405.333 0 0 0 512 106.667z m135.04 486.4a40.533 40.533 0 0 1 0 81.066h-94.507v53.974a40.533 40.533 0 1 1-81.066 0v-53.974H376.96a40.533 40.533 0 0 1 0-81.066h94.507V525.44H376.96a40.533 40.533 0 1 1 0-81.067h77.013L348.8 339.2a40.533 40.533 0 0 1 56.533-57.173L512 388.693l104.107-104.106a39.253 39.253 0 0 1 55.68 55.68L567.04 445.013h79.573a40.533 40.533 0 1 1 0 81.067h-94.08v66.987h94.507z" />
                  </svg>
                  赞赏
                </a>
                {/* <span className="h-4 w-px bg-zinc-300" /> */}
                {/* <a
                  href="#"
                  className="flex items-center hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    viewBox="0 0 1024 1024"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M512 916.210526c223.232 0 404.210526-180.978526 404.210526-404.210526 0-223.232-180.978526-404.210526-404.210526-404.210526-223.232 0-404.210526 180.978526-404.210526 404.210526 0 223.232 180.978526 404.210526 404.210526 404.210526z m0 80.842106C244.116211 997.052632 26.947368 779.883789 26.947368 512S244.116211 26.947368 512 26.947368s485.052632 217.168842 485.052632 485.052632-217.168842 485.052632-485.052632 485.052632z m-204.934737-536.495158l68.527158 55.592421c-17.650526 21.126737-23.713684 32.336842-25.869474 49.987368-3.853474 28.887579 9.512421 60.362105 37.510737 88.360421 43.115789 43.115789 88.360421 49.556211 120.670316 17.246316 17.677474-17.677474 24.144842-40.528842 18.108632-61.197474-6.036211-19.833263-8.192-22.851368-53.894737-96.121263-24.980211-39.639579-35.301053-63.784421-38.777263-91.351579-4.742737-39.235368 7.760842-74.132211 36.648421-102.992842 59.904-59.904 146.944-50.445474 221.07621 23.713684 49.125053 49.098105 71.114105 101.241263 63.784421 150.824421-3.449263 24.980211-11.210105 43.088842-28.887579 71.087158l-68.931368-54.298947c12.045474-17.246316 16.357053-27.567158 17.650526-43.52 2.155789-24.576-9.485474-50.849684-33.17221-74.563369-37.510737-37.483789-81.893053-43.951158-109.891369-15.925894-18.108632 18.081684-21.126737 40.070737-9.916631 68.50021 5.605053 13.365895 8.192 17.677474 45.271579 76.288 26.677895 41.364211 39.181474 70.251789 43.92421 96.525474 6.467368 42.684632-6.036211 77.608421-38.346105 109.918316-30.612211 30.585263-65.077895 46.08-100.405895 46.08-44.840421-0.835368-89.653895-24.117895-135.760842-70.224842-35.328-35.328-61.197474-78.416842-68.096-112.909474-5.605053-28.887579-1.724632-57.748211 11.210105-87.04 6.036211-13.797053 12.503579-23.713684 27.567158-43.978105z" />
                  </svg>
                  <span className="flex items-center">
                    小程序
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full ml-1 scale-90">
                      NEW
                    </span>
                  </span>
                </a> */}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/90 shadow">
              <h3 className="font-semibold">赵先生</h3>
              <p className="text-sm text-zinc-500 mt-2">
                “我的工作需要频繁下载视频，去水印壁纸鸭极大提升了我的效率。”
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-50 shadow">
              <h3 className="font-semibold">孙小姐</h3>
              <p className="text-sm text-zinc-500 mt-2">
                “解析和下载非常方便，尤其适合内容运营人员。”
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/90 shadow">
              <h3 className="font-semibold">李经理</h3>
              <p className="text-sm text-zinc-500 mt-2">
                “非常好用，能快速保存高清无水印的视频和图片。”
              </p>
            </div>
          </div>
        </section>

        {error && (
          <section className="max-w-6xl mx-auto px-6 mt-6">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          </section>
        )}

        {result && (
          <section className="max-w-6xl mx-auto px-6 mt-6">
            <div className="rounded-2xl border border-[#e4d8ff] bg-white/70 p-6 shadow">
              <h3 className="text-lg font-semibold">解析结果</h3>
              <div className="mt-3 space-y-3">
                {(result.downloadUrls || []).map((u: string, i: number) => (
                  <div
                    key={u + i}
                    className="rounded-xl bg-[#fbf9ff] p-3 text-sm"
                  >
                    <a
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 break-all"
                    >
                      {u}
                    </a>
                  </div>
                ))}
                {(result.liveUrls || []).map((u: string, i: number) => (
                  <div
                    key={u + i}
                    className="rounded-xl bg-[#fffaf0] p-3 text-sm"
                  >
                    预览：
                    <a
                      href={u}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 break-all"
                    >
                      {u}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-6 mt-12 mb-24">
          <h2 className="text-2xl font-bold text-center">常见问题</h2>
          <p className="text-center text-zinc-600 mt-2">
            快速解答您最关心的问题
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">去水印壁纸鸭是什么？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                去水印壁纸鸭是一个强大的在线下载工具，让用户可以从包括抖音、小红书、豆包、千问等平台下载自己喜爱的视频、图片。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">为什么还存在水印？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                水印为视频、图片本身自带的水印，本工具仅做解析和下载，无法去除原始内容中的水印。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">
                如果去水印壁纸鸭无法下载视频，我的选择是什么？
              </h4>
              <p className="text-sm text-zinc-600 mt-2">
                尽管支持多个平台，但有时由于源网站基础设施或政策的更改，获取视频可能会出现问题。如果出现这种情况，我们建议稍后再尝试获取视频，因为这可能是一个临时问题。然而，如果问题继续存在，建议将您的疑问与我们的支持团队联系。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">
                从去水印壁纸鸭下载是否合法并且不侵犯版权？
              </h4>
              <p className="text-sm text-zinc-600 mt-2">
                通常取决于您下载的视频及其版权情况。虽然去水印壁纸鸭为您提供了从各种平台检索视频的服务，但用户有责任尊重并遵守各个视频平台或内容创作者的版权政策。我们强烈建议仅将下载用于个人使用或为任何其他用途获得相应版权持有者的许可。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">
                使用去水印壁纸鸭下载在线视频是否安全？
              </h4>
              <p className="text-sm text-zinc-600 mt-2">
                是的，去水印壁纸鸭是一个完全安全的在线视频下载应用程序。我们提供对用户的安全性和隐私保护。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">下载后的视频打不开怎么办？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                这种情况极少发生，一般是文件后缀问题，把下载后的文件后缀名改为.mp4即可播放。如果还有疑问可与我们团队进行联系。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
