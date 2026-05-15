import Script from "next/script";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface StructuredDataProps {
  type?: "website" | "person" | "article" | "blog" | "breadcrumb";
  data?: Record<string, unknown> & { items?: BreadcrumbItem[] };
}

export default function StructuredData({
  type = "website",
  data,
}: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
    };

    switch (type) {
      case "website":
        return {
          ...baseData,
          "@type": "WebSite",
          name: "Tianci's Portfolio",
          description:
            "欢迎来到Tianci的个人网站！这里分享前端开发技术、项目作品和技术博客。",
          url: "https://itianci.cn",
          inLanguage: "zh-CN",
          author: {
            "@type": "Person",
            name: "Tianci",
            url: "https://github.com/dcileiu",
            jobTitle: "前端开发工程师",
            knowsAbout: [
              "React",
              "Next.js",
              "TypeScript",
              "JavaScript",
              "CSS",
              "HTML",
            ],
          },
          sameAs: ["https://github.com/dcileiu"],
          ...data,
        };

      case "person":
        return {
          ...baseData,
          "@type": "Person",
          name: "Tianci",
          jobTitle: "前端开发工程师",
          description:
            "专注于React、Next.js、TypeScript等现代Web开发技术的前端开发者",
          url: "https://itianci.cn",
          knowsAbout: [
            "React",
            "Next.js",
            "TypeScript",
            "JavaScript",
            "CSS",
            "HTML",
            "Web Development",
          ],
          sameAs: ["https://github.com/dcileiu"],
          ...data,
        };

      case "blog":
        return {
          ...baseData,
          "@type": "Blog",
          name: "Tianci's Tech Blog",
          description:
            "分享前端开发技术文章，包括React、Next.js、TypeScript等现代Web开发技术。",
          url: "https://itianci.cn/blog",
          author: {
            "@type": "Person",
            name: "Tianci",
          },
          publisher: {
            "@type": "Person",
            name: "Tianci",
          },
          inLanguage: "zh-CN",
          ...data,
        };

      case "article": {
        const url = (data?.url as string) || "https://itianci.cn";
        return {
          ...baseData,
          "@type": "Article",
          headline: data?.title || "技术文章",
          description: data?.description || "前端开发技术文章",
          author: {
            "@type": "Person",
            name: "Tianci",
            url: "https://itianci.cn",
          },
          publisher: {
            "@type": "Person",
            name: "Tianci",
            url: "https://itianci.cn",
          },
          datePublished: data?.publishedAt || new Date().toISOString(),
          dateModified: data?.updatedAt || new Date().toISOString(),
          image: data?.image || "https://itianci.cn/og-image.svg",
          url,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
          },
          articleSection: data?.articleSection || "前端开发",
          keywords: data?.keywords,
          wordCount: data?.wordCount,
          inLanguage: "zh-CN",
          ...data,
        };
      }

      case "breadcrumb": {
        const items = (data?.items as BreadcrumbItem[]) || [];
        return {
          ...baseData,
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: it.name,
            item: it.url,
          })),
        };
      }

      default:
        return baseData;
    }
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  );
}
