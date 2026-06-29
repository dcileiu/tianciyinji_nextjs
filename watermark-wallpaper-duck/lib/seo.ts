import { SITE_URL } from "@/lib/site";

/** 站点核心信息：集中维护，供 metadata、JSON-LD、llms.txt 复用 */
export const SITE = {
  name: "去水印壁纸鸭",
  url: SITE_URL,
  logo: "https://wallpaper.cdn.itianci.cn/wallpaper-wx/duck.webp",
  tagline: "免费在线视频图片去水印下载工具",
  description:
    "去水印壁纸鸭是一款免费在线去水印工具，专注于公众号、抖音、小红书、快手、哔哩哔哩等平台的视频与图片一键去水印并下载，无需登录，实时解析，高质量保存。",
  platforms: ["公众号", "抖音", "小红书", "快手", "哔哩哔哩"],
  features: [
    "无需登录，粘贴链接即可解析下载",
    "支持视频与图片去水印",
    "支持公众号、抖音、小红书、快手、哔哩哔哩等多平台",
    "实时处理，不存储用户内容",
    "提供去水印 API 接口，按调用量计费",
  ],
  contactWeChat: "xy020477",
} as const;

/** 常见问题：页面渲染与 FAQPage 结构化数据共享同一份数据，避免漂移 */
export const FAQ: { question: string; answer: string }[] = [
  {
    question: "去水印壁纸鸭是什么？",
    answer:
      "去水印壁纸鸭是一个强大的在线下载工具，让用户可以从包括抖音、小红书、快手、哔哩哔哩、公众号等平台下载自己喜爱的视频、图片。",
  },
  {
    question: "为什么还存在水印？",
    answer:
      "水印为视频、图片本身自带的水印，本工具仅做解析和下载，无法去除原始内容中的水印。",
  },
  {
    question: "如果去水印壁纸鸭无法下载视频，我的选择是什么？",
    answer:
      "尽管支持多个平台，但有时由于源网站基础设施或政策的更改，获取视频可能会出现问题。如果出现这种情况，我们建议稍后再尝试获取视频，因为这可能是一个临时问题。然而，如果问题继续存在，建议将您的疑问与我们的支持团队联系。",
  },
  {
    question: "从去水印壁纸鸭下载是否合法并且不侵犯版权？",
    answer:
      "通常取决于您下载的视频及其版权情况。虽然去水印壁纸鸭为您提供了从各种平台检索视频的服务，但用户有责任尊重并遵守各个视频平台或内容创作者的版权政策。我们强烈建议仅将下载用于个人使用或为任何其他用途获得相应版权持有者的许可。",
  },
  {
    question: "使用去水印壁纸鸭下载在线视频是否安全？",
    answer:
      "是的，去水印壁纸鸭是一个完全安全的在线视频下载应用程序。我们提供对用户的安全性和隐私保护。",
  },
  {
    question: "下载后的视频打不开怎么办？",
    answer:
      "这种情况极少发生，一般是文件后缀问题，把下载后的文件后缀名改为.mp4即可播放。如果还有疑问可与我们团队进行联系。",
  },
];

/**
 * 构建 JSON-LD 结构化数据图。
 * 同时面向传统搜索引擎（富结果）与生成式引擎（GEO，便于 AI 理解与引用）。
 */
export function buildJsonLd() {
  const orgId = `${SITE.url}/#organization`;
  const siteId = `${SITE.url}/#website`;
  const appId = `${SITE.url}/#webapp`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: SITE.name,
        url: SITE.url,
        logo: SITE.logo,
        description: SITE.description,
      },
      {
        "@type": "WebSite",
        "@id": siteId,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "zh-CN",
        publisher: { "@id": orgId },
      },
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": appId,
        name: SITE.name,
        url: SITE.url,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript",
        inLanguage: "zh-CN",
        description: SITE.description,
        featureList: SITE.features,
        publisher: { "@id": orgId },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE.url}/#faq`,
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

/** 生成 llms.txt 内容（Markdown），供 ChatGPT、Perplexity 等生成式引擎读取站点概览 */
export function buildLlmsTxt() {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    "## 关于",
    "",
    `${SITE.name}是一款${SITE.tagline}，无需登录、无需安装，粘贴分享链接或口令即可在线解析并下载无水印的高清视频与图片。所有处理均为实时进行，不存储任何用户内容。`,
    "",
    "## 支持的平台",
    "",
    ...SITE.platforms.map((p) => `- ${p}`),
    "",
    "## 核心功能",
    "",
    ...SITE.features.map((f) => `- ${f}`),
    "",
    "## 重要链接",
    "",
    `- [首页](${SITE.url}/)：在线去水印解析与下载`,
    `- [API 接口价格](${SITE.url}/api-pricing)：去水印解析 API，按调用量计费，亦为联系方式`,
    `- [服务条款](${SITE.url}/terms)`,
    `- [隐私政策](${SITE.url}/privacy)`,
    "",
    "## 常见问题",
    "",
    ...FAQ.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## 联系方式",
    "",
    `如需开通 API 或商务合作，请联系客服微信：${SITE.contactWeChat}（添加请备注「API」）。`,
    "",
  ];
  return lines.join("\n");
}
