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
            <span className="cursor-pointer hover:text-zinc-900">微信小程序</span>
            <div className="absolute right-0 top-full mt-2 z-10 hidden group-hover:block">
              <div className="bg-white rounded-xl p-3 shadow-lg border border-zinc-100">
                <Image
                  src="/icons/qr.jpg"
                  alt="微信小程序物料码"
                  width={160}
                  height={160}
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
                请输入 URL 地址
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

              <div className="mt-4 text-sm text-zinc-500">当前支持的平台：</div>
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
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/90 shadow">
              <h3 className="font-semibold">张先生</h3>
              <p className="text-sm text-zinc-500 mt-2">
                “我的工作需要频繁下载视频，去水印壁纸鸭极大提升了我的效率。”
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-amber-50 shadow">
              <h3 className="font-semibold">单小姐</h3>
              <p className="text-sm text-zinc-500 mt-2">
                “解析和下载非常方便，尤其适合内容运营人员。”
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/90 shadow">
              <h3 className="font-semibold">刘经理</h3>
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
                    直播/预览：
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">去水印壁纸鸭是什么？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                去水印壁纸鸭是一个免费的在线去水印下载工具，支持抖音、小红书、快手等平台的视频与图片解析与下载。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">为什么还有水印？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                部分视频带有平台自身水印或经过 DRM 保护，工具可能无法完全去除。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">下载是否合法？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                请仅在拥有版权或授权的前提下使用本工具，尊重创作者权益。
              </p>
            </div>
            <div className="p-6 bg-white/90 rounded-2xl shadow">
              <h4 className="font-semibold">下载后的视频打不开怎么办？</h4>
              <p className="text-sm text-zinc-600 mt-2">
                请检查文件格式并尝试使用通用播放器播放，如问题仍然存在可联系我们。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
