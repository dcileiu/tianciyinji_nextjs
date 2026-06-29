import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-zinc-600">
          <Link className="hover:text-blue-600 transition-colors" href="/terms">
            服务条款
          </Link>
          <Link
            className="hover:text-blue-600 transition-colors"
            href="/privacy"
          >
            隐私政策
          </Link>
          <Link
            className="hover:text-blue-600 transition-colors"
            href="/api-pricing"
          >
            联系我们
          </Link>
        </div>
      </div>
    </footer>
  );
}
