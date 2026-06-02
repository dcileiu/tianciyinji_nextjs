export function escapeMetaAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function buildSeoMetaTags(d: {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image: string;
  siteName: string;
}) {
  const e = escapeMetaAttr;
  const lines: string[] = [];
  if (d.title) lines.push(`<title>${e(d.title)}</title>`);
  if (d.description) lines.push(`<meta name="description" content="${e(d.description)}" />`);
  if (d.keywords) lines.push(`<meta name="keywords" content="${e(d.keywords)}" />`);
  if (d.url) lines.push(`<link rel="canonical" href="${e(d.url)}" />`);
  lines.push("");
  lines.push(`<meta property="og:type" content="website" />`);
  if (d.title) lines.push(`<meta property="og:title" content="${e(d.title)}" />`);
  if (d.description) lines.push(`<meta property="og:description" content="${e(d.description)}" />`);
  if (d.url) lines.push(`<meta property="og:url" content="${e(d.url)}" />`);
  if (d.siteName) lines.push(`<meta property="og:site_name" content="${e(d.siteName)}" />`);
  if (d.image) lines.push(`<meta property="og:image" content="${e(d.image)}" />`);
  lines.push("");
  lines.push(`<meta name="twitter:card" content="${d.image ? "summary_large_image" : "summary"}" />`);
  if (d.title) lines.push(`<meta name="twitter:title" content="${e(d.title)}" />`);
  if (d.description) lines.push(`<meta name="twitter:description" content="${e(d.description)}" />`);
  if (d.image) lines.push(`<meta name="twitter:image" content="${e(d.image)}" />`);
  return lines.join("\n").trim();
}

export function buildRobotsTxt(d: {
  userAgent: string;
  allow: string;
  disallow: string;
  sitemap: string;
}) {
  const toList = (value: string) =>
    value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  const lines: string[] = [];
  lines.push(`User-agent: ${d.userAgent.trim() || "*"}`);
  const allow = toList(d.allow);
  const disallow = toList(d.disallow);
  allow.forEach((path) => lines.push(`Allow: ${path}`));
  disallow.forEach((path) => lines.push(`Disallow: ${path}`));
  if (allow.length === 0 && disallow.length === 0) lines.push("Disallow:");
  const sitemaps = toList(d.sitemap);
  if (sitemaps.length > 0) {
    lines.push("");
    sitemaps.forEach((url) => lines.push(`Sitemap: ${url}`));
  }
  return lines.join("\n");
}

export function buildJsonLd(
  type: "Article" | "WebSite" | "Organization",
  d: {
    name: string;
    url: string;
    description: string;
    author: string;
    image: string;
    date: string;
  },
) {
  let obj: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
  };
  if (type === "Article") {
    obj = {
      ...obj,
      headline: d.name || undefined,
      description: d.description || undefined,
      image: d.image || undefined,
      datePublished: d.date || undefined,
      author: d.author ? { "@type": "Person", name: d.author } : undefined,
      mainEntityOfPage: d.url || undefined,
    };
  } else if (type === "Organization") {
    obj = {
      ...obj,
      name: d.name || undefined,
      url: d.url || undefined,
      logo: d.image || undefined,
      description: d.description || undefined,
    };
  } else {
    obj = {
      ...obj,
      name: d.name || undefined,
      url: d.url || undefined,
      description: d.description || undefined,
    };
  }
  const clean = JSON.parse(JSON.stringify(obj));
  return `<script type="application/ld+json">\n${JSON.stringify(clean, null, 2)}\n</script>`;
}

export function analyzeKeywordDensity(text: string, keyword: string) {
  const chars = text.replace(/\s/g, "").length;
  const tokens = text
    .toLowerCase()
    .split(/[\s,.;:!?，。、；：！？\n\r\t()[\]{}"'`/\\|]+/)
    .filter((token) => token.length >= 2);
  const total = tokens.length;
  const freq = new Map<string, number>();
  tokens.forEach((token) => freq.set(token, (freq.get(token) || 0) + 1));
  const top = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word, count]) => ({
      word,
      count,
      ratio: total ? count / total : 0,
    }));

  let keywordStat: { keyword: string; occurrences: number; density: number } | null = null;
  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    const escaped = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const occurrences = (text.match(new RegExp(escaped, "gi")) || []).length;
    keywordStat = {
      keyword: trimmedKeyword,
      occurrences,
      density: chars ? (occurrences * trimmedKeyword.length) / chars : 0,
    };
  }

  return { chars, totalTokens: total, top, keyword: keywordStat };
}
