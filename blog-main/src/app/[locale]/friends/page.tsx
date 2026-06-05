import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import { pageTitle } from "@/lib/site-config";
import { buildCollectionPageJsonLd, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = normalizeLocale((await params).locale);
  const text = getDictionary(locale).friends;
  return buildPageMetadata({
    title: pageTitle(text.metadataTitle),
    description: text.metadataDescription,
    path: "/friends",
    keywords: [...text.metadataKeywords],
    locale,
  });
}

const friends = [
  {
    name: "刘明野的工具箱",
    href: "https://tools.liumingye.cn/",
    description: "好用、易用的在线工具与站点导航，内容持续扩充。",
  },
] as const;

export default async function FriendsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = normalizeLocale((await params).locale);
  const text = getDictionary(locale).friends;
  return (
    <>
      <JsonLd
        data={buildCollectionPageJsonLd({
          title: pageTitle(text.metadataTitle),
          description: text.metadataDescription,
          path: "/friends",
          locale,
        })}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-24">
        <header className="mb-16">
          <h1 className="mb-4 text-4xl font-medium tracking-tight text-black md:text-5xl lg:text-6xl dark:text-white">
            {text.title}
          </h1>
          <p className="mb-8 text-lg text-black/50 dark:text-white/50">
            {text.metadataDescription}
          </p>
          <div className="h-[2px] w-16 bg-black dark:bg-white" />
        </header>

        <ul className="flex flex-col gap-4">
          {friends.map((item, index) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="group flex h-full flex-col rounded-3xl border border-black/6 bg-black/[0.02] p-6 transition-colors hover:border-black/12 hover:bg-black/[0.04] sm:p-8 dark:border-white/6 dark:bg-white/[0.02] dark:hover:border-white/12 dark:hover:bg-white/[0.04]"
              >
                <span className="mb-2 text-lg font-medium text-black group-hover:underline dark:text-white">
                  {text.items[index]?.name ?? item.name}
                </span>
                <span className="mb-4 flex-1 text-sm leading-relaxed text-black/65 dark:text-white/65">
                  {text.items[index]?.description ?? item.description}
                </span>
                <span className="text-sm text-black/45 dark:text-white/45">
                  {item.href.replace(/^https:\/\//, "")}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
