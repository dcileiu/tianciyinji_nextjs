import Link from 'next/link';

// 根级 404：仅用于未进入 [locale] 段的极少数路径（绝大多数 404 会落到 [locale]/not-found）。
// 此处不依赖 I18nProvider，保持自包含。
export default function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tighter text-black/10 dark:text-white/10">404</h1>
      <p className="mt-4 text-lg text-black/60 dark:text-white/60">页面不存在 · Page not found</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
      >
        返回首页 · Back home
      </Link>
    </div>
  );
}
