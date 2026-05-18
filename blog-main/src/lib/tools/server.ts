import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import dns from 'node:dns/promises';
import net from 'node:net';
import type { IncomingHttpHeaders } from 'node:http';
import { load } from 'cheerio';
import TurndownService from 'turndown';
import { ANSWER_BOOK_ENTRIES, FALLBACK_HISTORY_EVENTS, FALLBACK_POEMS } from './content';

type GeoIpRecord =
  | {
      range?: [number, number];
      country?: string;
      region?: string;
      city?: string;
      ll?: [number, number];
      metro?: number;
      area?: number;
      eu?: string;
      timezone?: string;
    }
  | null;

type GeoIpModule = {
  lookup: (ip: string) => GeoIpRecord;
};

type QueryMobilePhoneArea = (phone: string) => { province?: string; city?: string; type?: string } | null;

let geoipModule: GeoIpModule | null = null;
let mobileAreaModule: QueryMobilePhoneArea | null = null;

function loadGeoIpModule() {
  if (!geoipModule) {
    geoipModule = require('geoip-lite') as GeoIpModule;
  }
  return geoipModule;
}

function loadMobileAreaModule() {
  if (!mobileAreaModule) {
    mobileAreaModule = require('query-mobile-phone-area') as QueryMobilePhoneArea;
  }
  return mobileAreaModule;
}

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

type ToolPayload = Record<string, unknown> | undefined;

function getString(payload: ToolPayload, key: string, fallback = '') {
  const value = payload?.[key];
  return typeof value === 'string' ? value.trim() : fallback;
}

function getNumber(payload: ToolPayload, key: string, fallback = 0) {
  const value = payload?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function pickRandom<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function md5(input: string) {
  return createHash('md5').update(input).digest('hex');
}

function normalizeUrl(input: string) {
  const raw = input.trim();
  if (!raw) throw new Error('请输入有效的 URL。');
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('只支持 http 或 https 地址。');
  return url;
}

function getHostAndPort(input: string, defaultPort = 443) {
  const raw = input.trim();
  if (!raw) throw new Error('请输入目标地址。');

  try {
    const url = normalizeUrl(raw);
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : defaultPort,
      original: raw,
    };
  } catch {
    const cleaned = raw.replace(/^tcp:\/\//i, '').replace(/^udp:\/\//i, '');
    const match = cleaned.match(/^\[([^[\]]+)\](?::(\d+))?$|^([^:/\s]+)(?::(\d+))?$/);
    if (!match) throw new Error('目标地址格式不正确。');

    const host = match[1] || match[3];
    const portString = match[2] || match[4];
    const port = portString ? Number(portString) : defaultPort;
    if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error('端口范围应在 1 到 65535 之间。');

    return { host, port, original: raw };
  }
}

function isPrivateIpv4(ip: string) {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return false;
  if (parts[0] === 10 || parts[0] === 127) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 0) return true;
  return false;
}

function isPrivateIpLiteral(ip: string) {
  const normalized = ip.trim().toLowerCase();
  if (net.isIPv4(normalized)) return isPrivateIpv4(normalized);
  if (net.isIPv6(normalized)) {
    return (
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80:') ||
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:192.168.') ||
      normalized.startsWith('::ffff:172.16.') ||
      normalized.startsWith('::ffff:172.17.') ||
      normalized.startsWith('::ffff:172.18.') ||
      normalized.startsWith('::ffff:172.19.') ||
      normalized.startsWith('::ffff:172.2') ||
      normalized.startsWith('::ffff:172.30.') ||
      normalized.startsWith('::ffff:172.31.')
    );
  }
  return false;
}

async function assertPublicTarget(host: string) {
  const normalized = host.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!normalized) throw new Error('目标地址不能为空。');
  if (normalized === 'localhost' || normalized.endsWith('.local')) {
    throw new Error('出于安全考虑，不允许探测本地或局域网地址。');
  }
  if (isPrivateIpLiteral(normalized)) {
    throw new Error('出于安全考虑，不允许探测内网或回环地址。');
  }

  try {
    const addresses = await dns.lookup(normalized, { all: true });
    if (addresses.some((entry) => isPrivateIpLiteral(entry.address))) {
      throw new Error('出于安全考虑，不允许探测解析到内网的目标。');
    }
  } catch (error) {
    if (error instanceof Error && /安全考虑/.test(error.message)) throw error;
  }
}

async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...(init?.headers || {}),
      },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readPage(url: URL) {
  await assertPublicTarget(url.hostname);
  const response = await fetchWithTimeout(url.toString(), { redirect: 'follow' }, 15000);
  if (!response.ok) throw new Error(`请求失败：${response.status} ${response.statusText}`);
  const html = await response.text();
  return {
    html,
    finalUrl: response.url || url.toString(),
    status: response.status,
    contentType: response.headers.get('content-type') || '',
  };
}

function absoluteUrl(candidate: string | undefined, baseUrl: string) {
  if (!candidate) return '';
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return '';
  }
}

function extractMetadata(html: string, baseUrl: string) {
  const $ = load(html);
  const title = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').first().text().trim();
  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    '';
  const favicon =
    absoluteUrl($('link[rel="icon"]').attr('href'), baseUrl) ||
    absoluteUrl($('link[rel="shortcut icon"]').attr('href'), baseUrl) ||
    absoluteUrl($('link[rel="apple-touch-icon"]').attr('href'), baseUrl) ||
    absoluteUrl('/favicon.ico', baseUrl);

  return {
    title: title || new URL(baseUrl).hostname,
    description: description.trim(),
    canonical: absoluteUrl($('link[rel="canonical"]').attr('href'), baseUrl),
    favicon,
    keywords: ($('meta[name="keywords"]').attr('content') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    openGraph: {
      image: absoluteUrl($('meta[property="og:image"]').attr('content'), baseUrl),
      type: $('meta[property="og:type"]').attr('content') || '',
      siteName: $('meta[property="og:site_name"]').attr('content') || '',
    },
    twitter: {
      card: $('meta[name="twitter:card"]').attr('content') || '',
      image: absoluteUrl($('meta[name="twitter:image"]').attr('content'), baseUrl),
    },
  };
}

function extractPageImages(html: string, baseUrl: string) {
  const $ = load(html);
  const images = new Map<string, { url: string; alt: string; width?: string; height?: string }>();

  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, element) => {
    const url = absoluteUrl($(element).attr('content'), baseUrl);
    if (url) images.set(url, { url, alt: 'social-preview' });
  });

  $('img').each((_, element) => {
    const src =
      $(element).attr('src') ||
      $(element).attr('data-src') ||
      ($(element).attr('srcset') || '')
        .split(',')
        .map((part) => part.trim().split(/\s+/)[0])
        .find(Boolean);
    const url = absoluteUrl(src, baseUrl);
    if (!url) return;
    images.set(url, {
      url,
      alt: $(element).attr('alt') || '',
      width: $(element).attr('width') || undefined,
      height: $(element).attr('height') || undefined,
    });
  });

  return Array.from(images.values()).slice(0, 40);
}

function convertHtmlToMarkdown(html: string) {
  const $ = load(html);
  $('script, style, noscript, iframe, form, nav, footer, header, aside').remove();
  const root = $('article').first().html() || $('main').first().html() || $('body').html() || '';

  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });
  turndown.keep(['table']);
  turndown.addRule('preformattedCode', {
    filter: ['pre'],
    replacement: (_content, node) => {
      const codeNode = (node as HTMLElement).querySelector?.('code');
      const code = codeNode?.textContent || (node.textContent || '');
      return `\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`;
    },
  });

  return turndown.turndown(root).trim();
}

type LinkSource = 'default' | 'nav' | 'sitemap';

type LinkCandidate = {
  label: string;
  url: string;
  path: string;
  source: LinkSource;
  score: number;
};

type RobotsDiscovery = {
  url: string;
  found: boolean;
  sitemapUrls: string[];
};

type SitemapDiscovery = {
  url: string;
  found: boolean;
  urls: string[];
};

function cleanSnippet(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  const normalized = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/g, '');
  return normalized || '/';
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function humanizePathname(pathname: string) {
  if (pathname === '/') return 'Home';
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => safeDecodeURIComponent(segment).replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').trim())
    .filter(Boolean);

  const label = segments[segments.length - 1] || pathname;
  return label
    .split(' ')
    .map((word) => (/^[a-z0-9]+$/i.test(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function isIgnoredPagePath(pathname: string) {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/') ||
    /\.(?:avif|bmp|css|gif|ico|jpe?g|js|json|map|mjs|mp3|mp4|pdf|png|svg|txt|webm|webp|woff2?|xml|zip|gz|7z|tar)$/i.test(
      pathname
    )
  );
}

function normalizeSameOriginUrl(rawValue: string | undefined, siteOrigin: string) {
  if (!rawValue) return '';
  const resolved = absoluteUrl(rawValue, siteOrigin);
  if (!resolved) return '';

  try {
    const url = new URL(resolved);
    if (url.origin !== siteOrigin) return '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function normalizeSitePageUrl(rawValue: string | undefined, siteOrigin: string) {
  const normalized = normalizeSameOriginUrl(rawValue, siteOrigin);
  if (!normalized) return '';

  const url = new URL(normalized);
  url.search = '';
  url.pathname = normalizePathname(url.pathname);
  if (isIgnoredPagePath(url.pathname)) return '';
  return url.toString();
}

function scoreLinkCandidate(pathname: string, label: string, source: LinkSource) {
  const depth = pathname === '/' ? 0 : pathname.split('/').filter(Boolean).length;
  let score = source === 'nav' ? 140 : source === 'default' ? 220 : 80;

  if (pathname === '/') score += 600;
  if (depth === 1) score += 140;
  if (depth === 2) score += 60;
  if (depth >= 4) score -= 80;

  if (/^\/(about|about-us|me|profile|bio)$/i.test(pathname)) score += 320;
  if (/^\/(blog|posts?|articles?|archive)$/i.test(pathname)) score += 300;
  if (/^\/(docs?|guide|guides|manual|kb|knowledge-base)$/i.test(pathname)) score += 280;
  if (/^\/(works?|projects?|portfolio)$/i.test(pathname)) score += 260;
  if (/^\/(tools?|resources?|links?)$/i.test(pathname)) score += 240;
  if (/^\/(pricing|plans?)$/i.test(pathname)) score += 120;
  if (/^\/(contact|support)$/i.test(pathname)) score += 100;
  if (/^\/(privacy|terms|cookies?)$/i.test(pathname)) score += 20;
  if (/\/(post|posts|article|articles|blog|docs?|guide|guides|resources?|works?|projects?)\//i.test(pathname)) score += 40;
  if (cleanSnippet(label, 60).length > 42) score -= 20;

  return score;
}

function dedupeLinkCandidates(candidates: LinkCandidate[]) {
  const byUrl = new Map<string, LinkCandidate>();

  for (const candidate of candidates.sort((left, right) => right.score - left.score)) {
    if (!byUrl.has(candidate.url)) {
      byUrl.set(candidate.url, candidate);
    }
  }

  return Array.from(byUrl.values()).sort((left, right) => right.score - left.score);
}

function extractHomepageLinks(html: string, baseUrl: string) {
  const $ = load(html);
  const siteOrigin = new URL(baseUrl).origin;
  const selectors = ['header a[href]', 'nav a[href]', 'main a[href]', 'footer a[href]', 'a[href]'] as const;
  const candidates: LinkCandidate[] = [];
  const seen = new Set<string>();

  selectors.forEach((selector, selectorIndex) => {
    $(selector).each((elementIndex, element) => {
      if (candidates.length >= 90) return false;

      const href = $(element).attr('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }

      const url = normalizeSitePageUrl(href, siteOrigin);
      if (!url || seen.has(url)) return;
      seen.add(url);

      const path = normalizePathname(new URL(url).pathname);
      const label =
        cleanSnippet($(element).text() || $(element).attr('aria-label') || $(element).attr('title') || humanizePathname(path), 60) ||
        humanizePathname(path);

      candidates.push({
        label,
        url,
        path,
        source: 'nav',
        score: scoreLinkCandidate(path, label, 'nav') - selectorIndex * 8 - elementIndex * 0.2,
      });
    });
  });

  return dedupeLinkCandidates(candidates);
}

function extractRssUrl(html: string, baseUrl: string) {
  const $ = load(html);
  return (
    normalizeSameOriginUrl(
      $('link[rel="alternate"][type="application/rss+xml"]').attr('href') ||
        $('link[rel="alternate"][type="application/atom+xml"]').attr('href') ||
        $('a[href*="/rss"]').first().attr('href'),
      new URL(baseUrl).origin
    ) || ''
  );
}

function extractDocumentLanguage(html: string) {
  const $ = load(html);
  return cleanSnippet(
    $('html').attr('lang') ||
      $('meta[http-equiv="content-language"]').attr('content') ||
      $('meta[property="og:locale"]').attr('content') ||
      '',
    24
  );
}

async function readTextResource(resourceUrl: string, accept: string, timeoutMs = 10000) {
  const url = new URL(resourceUrl);
  await assertPublicTarget(url.hostname);
  const response = await fetchWithTimeout(
    url.toString(),
    {
      headers: { Accept: accept },
      redirect: 'follow',
    },
    timeoutMs
  );
  if (!response.ok) return null;

  const finalUrl = response.url || url.toString();
  const finalParsed = new URL(finalUrl);
  await assertPublicTarget(finalParsed.hostname);
  if (finalParsed.origin !== url.origin) return null;

  return {
    url: finalUrl,
    text: await response.text(),
    contentType: response.headers.get('content-type') || '',
  };
}

async function readRobotsFile(siteOrigin: string): Promise<RobotsDiscovery> {
  const fallbackUrl = `${siteOrigin}/robots.txt`;

  try {
    const resource = await readTextResource(fallbackUrl, 'text/plain,text/*;q=0.9,*/*;q=0.5', 8000);
    if (!resource) {
      return { url: fallbackUrl, found: false, sitemapUrls: [] };
    }

    const sitemapUrls = resource.text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^sitemap:/i.test(line))
      .map((line) => normalizeSameOriginUrl(line.replace(/^sitemap:\s*/i, ''), siteOrigin))
      .filter(Boolean);

    return {
      url: resource.url,
      found: true,
      sitemapUrls: Array.from(new Set(sitemapUrls)),
    };
  } catch {
    return { url: fallbackUrl, found: false, sitemapUrls: [] };
  }
}

function parseSitemapDocument(xml: string, siteOrigin: string) {
  const $ = load(xml, { xmlMode: true });

  const urls = $('url > loc')
    .map((_, element) => normalizeSitePageUrl($(element).text(), siteOrigin))
    .get()
    .filter(Boolean);

  const sitemapUrls = $('sitemap > loc')
    .map((_, element) => normalizeSameOriginUrl($(element).text(), siteOrigin))
    .get()
    .filter(Boolean);

  return {
    urls: Array.from(new Set(urls)),
    sitemapUrls: Array.from(new Set(sitemapUrls)),
  };
}

async function readSitemapUrls(sitemapUrl: string, siteOrigin: string, visited = new Set<string>(), depth = 0): Promise<string[]> {
  if (visited.has(sitemapUrl) || depth > 1) return [];
  visited.add(sitemapUrl);

  try {
    const resource = await readTextResource(sitemapUrl, 'application/xml,text/xml;q=0.9,*/*;q=0.5', 10000);
    if (!resource) return [];

    const parsed = parseSitemapDocument(resource.text, siteOrigin);
    let urls = parsed.urls.slice(0, 80);

    for (const childSitemap of parsed.sitemapUrls.slice(0, 3)) {
      const childUrls = await readSitemapUrls(childSitemap, siteOrigin, visited, depth + 1);
      urls = Array.from(new Set([...urls, ...childUrls])).slice(0, 80);
      if (urls.length >= 80) break;
    }

    return urls;
  } catch {
    return [];
  }
}

async function discoverSitemap(siteOrigin: string, robots: RobotsDiscovery): Promise<SitemapDiscovery> {
  const candidates = Array.from(
    new Set(
      [robots.url.replace(/robots\.txt$/i, 'sitemap.xml'), ...robots.sitemapUrls, `${siteOrigin}/sitemap.xml`, `${siteOrigin}/sitemap_index.xml`]
        .map((item) => normalizeSameOriginUrl(item, siteOrigin))
        .filter(Boolean)
    )
  );

  for (const candidate of candidates) {
    const urls = await readSitemapUrls(candidate, siteOrigin);
    if (urls.length > 0) {
      return {
        url: candidate,
        found: true,
        urls,
      };
    }
  }

  return {
    url: candidates[0] || `${siteOrigin}/sitemap.xml`,
    found: false,
    urls: [],
  };
}

function buildSitemapCandidates(urls: string[]) {
  return dedupeLinkCandidates(
    urls.map((url) => {
      const path = normalizePathname(new URL(url).pathname);
      const label = humanizePathname(path);
      return {
        label,
        url,
        path,
        source: 'sitemap' as const,
        score: scoreLinkCandidate(path, label, 'sitemap'),
      };
    })
  );
}

function selectPrimarySections(homeLinks: LinkCandidate[], sitemapLinks: LinkCandidate[], siteOrigin: string) {
  const rootUrl = new URL(siteOrigin);
  rootUrl.pathname = '/';
  rootUrl.search = '';
  rootUrl.hash = '';

  return dedupeLinkCandidates([
    {
      label: 'Home',
      url: rootUrl.toString(),
      path: '/',
      source: 'default',
      score: scoreLinkCandidate('/', 'Home', 'default'),
    },
    ...homeLinks,
    ...sitemapLinks.filter((item) => item.path === '/' || item.path.split('/').filter(Boolean).length <= 2),
  ]).slice(0, 8);
}

function selectExamplePages(primarySections: LinkCandidate[], sitemapLinks: LinkCandidate[], homeLinks: LinkCandidate[]) {
  const primaryUrls = new Set(primarySections.map((item) => item.url));

  const contentFirst = sitemapLinks.filter((item) => {
    if (primaryUrls.has(item.url)) return false;
    if (/\/(post|posts|article|articles|blog|docs?|guide|guides|resources?|works?|projects?)\//i.test(item.path)) return true;
    return item.path.split('/').filter(Boolean).length >= 3;
  });

  const fallback = dedupeLinkCandidates(
    [...contentFirst, ...sitemapLinks, ...homeLinks].filter((item) => !primaryUrls.has(item.url) && item.path !== '/')
  );

  return fallback.slice(0, 6);
}

function buildSummaryText(siteTitle: string, description: string, primarySections: LinkCandidate[]) {
  if (description) return description;

  const sectionLabels = primarySections
    .filter((section) => section.path !== '/')
    .slice(0, 4)
    .map((section) => section.label);

  if (sectionLabels.length) {
    return `${siteTitle} appears to include sections such as ${sectionLabels.join(', ')}.`;
  }

  return `${siteTitle} is a website with a public homepage and machine-readable discovery endpoints.`;
}

function formatLinkLine(candidate: { label: string; url: string }, note?: string) {
  return `- [${candidate.label}](${candidate.url})${note ? `: ${cleanSnippet(note, 120)}` : ''}`;
}

function buildLlmsDocument(options: {
  siteTitle: string;
  siteUrl: string;
  description: string;
  language: string;
  primarySections: LinkCandidate[];
  examplePages: LinkCandidate[];
  robots: RobotsDiscovery;
  sitemap: SitemapDiscovery;
  rssUrl: string;
}) {
  const summary = buildSummaryText(options.siteTitle, options.description, options.primarySections);
  const lines = [
    `# ${options.siteTitle}`,
    '',
    `> ${summary}`,
    '',
    `Site URL: ${options.siteUrl}`,
    options.language ? `Language: ${options.language}` : '',
    '',
    '## Site Summary',
    summary,
    '',
    '## Primary Sections',
    ...options.primarySections.map((section) => formatLinkLine(section)),
    '',
    options.examplePages.length ? '## Example Content URLs' : '',
    ...options.examplePages.map((page) => formatLinkLine(page)),
    options.examplePages.length ? '' : '',
    '## Machine-Readable Endpoints',
    formatLinkLine({ label: 'robots.txt', url: options.robots.url }, options.robots.found ? 'discovered successfully' : 'not found during generation'),
    formatLinkLine({ label: 'sitemap.xml', url: options.sitemap.url }, options.sitemap.found ? `${options.sitemap.urls.length} URL(s) discovered` : 'not found during generation'),
    options.rssUrl ? formatLinkLine({ label: 'RSS / Feed', url: options.rssUrl }) : '',
    '',
    '## Guidance For AI Systems',
    '- Prefer canonical section URLs before citing deeper content pages.',
    '- Use the sitemap and feed endpoints for fuller coverage when available.',
    '- Treat titles and summaries as homepage-derived hints; verify details on the linked pages when precision matters.',
  ];

  return lines.filter((line, index, array) => {
    if (!line && !array[index - 1]) return false;
    return Boolean(line) || Boolean(array[index - 1]) || Boolean(array[index + 1]);
  });
}

function parsePortExpression(input: string) {
  const ports = new Set<number>();
  for (const segment of input.split(',').map((item) => item.trim()).filter(Boolean)) {
    if (segment.includes('-')) {
      const [startRaw, endRaw] = segment.split('-');
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start <= 0 || end <= 0 || start > 65535 || end > 65535) {
        throw new Error(`端口段 ${segment} 无效。`);
      }
      const min = Math.min(start, end);
      const max = Math.max(start, end);
      if (max - min > 64) throw new Error('单次端口范围最多允许 65 个端口。');
      for (let port = min; port <= max; port += 1) ports.add(port);
    } else {
      const port = Number(segment);
      if (!Number.isInteger(port) || port <= 0 || port > 65535) throw new Error(`端口 ${segment} 无效。`);
      ports.add(port);
    }
  }

  if (ports.size === 0) throw new Error('请输入至少一个端口。');
  if (ports.size > 40) throw new Error('单次最多扫描 40 个端口。');
  return Array.from(ports).sort((a, b) => a - b);
}

function resolveClientIp(headers: Headers | IncomingHttpHeaders) {
  const getHeader = (key: string) => {
    if (headers instanceof Headers) return headers.get(key) || '';
    const value = headers[key.toLowerCase()];
    return Array.isArray(value) ? value[0] || '' : value || '';
  };

  const forwarded = getHeader('x-forwarded-for');
  const realIp = getHeader('x-real-ip');
  const candidate = forwarded.split(',')[0]?.trim() || realIp.trim() || '';
  return candidate || '127.0.0.1';
}

function decodeMinecraftTexture(value: string | undefined) {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

async function probePort(host: string, port: number, timeoutMs = 900) {
  return new Promise<{ port: number; open: boolean; latency: number | null; error?: string }>((resolve) => {
    const socket = new net.Socket();
    const startedAt = Date.now();
    let settled = false;

    const finish = (open: boolean, error?: string) => {
      if (settled) return;
      settled = true;
      const latency = open ? Date.now() - startedAt : null;
      socket.destroy();
      resolve({ port, open, latency, error });
    };

    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false, 'timeout'));
    socket.once('error', (error) => finish(false, error.message));
    socket.connect(port, host);
  });
}

async function runToolInternal(tool: string, payload: ToolPayload, requestHeaders: Headers) {
  switch (tool) {
    case 'md5': {
      const text = getString(payload, 'text');
      const expected = getString(payload, 'expected').toLowerCase();
      const hash = md5(text);
      return {
        hash,
        matches: expected ? hash === expected : null,
      };
    }

    case 'client-ip': {
      const ip = resolveClientIp(requestHeaders);
      return {
        ip,
        forwardedFor: requestHeaders.get('x-forwarded-for') || '',
        userAgent: requestHeaders.get('user-agent') || '',
      };
    }

    case 'dns-lookup': {
      const host = getHostAndPort(getString(payload, 'host')).host;
      await assertPublicTarget(host);
      const [lookupResult, a, aaaa, cname, mx, ns, txt] = await Promise.allSettled([
        dns.lookup(host, { all: true }),
        dns.resolve4(host),
        dns.resolve6(host),
        dns.resolveCname(host),
        dns.resolveMx(host),
        dns.resolveNs(host),
        dns.resolveTxt(host),
      ]);

      const unwrap = <T,>(value: PromiseSettledResult<T>, fallback: T) => (value.status === 'fulfilled' ? value.value : fallback);
      return {
        host,
        lookup: unwrap(lookupResult, [] as { address: string; family: number }[]),
        a: unwrap(a, [] as string[]),
        aaaa: unwrap(aaaa, [] as string[]),
        cname: unwrap(cname, [] as string[]),
        mx: unwrap(mx, [] as { exchange: string; priority: number }[]),
        ns: unwrap(ns, [] as string[]),
        txt: unwrap(txt, [] as string[][]).map((row) => row.join('')),
      };
    }

    case 'ping': {
      const count = Math.min(Math.max(getNumber(payload, 'count', 4), 1), 6);
      const { host, port } = getHostAndPort(getString(payload, 'host'), getNumber(payload, 'port', 443) || 443);
      await assertPublicTarget(host);

      const attempts = [];
      for (let index = 0; index < count; index += 1) {
        attempts.push(await probePort(host, port, 1200));
      }

      const successful = attempts.filter((item) => item.open && item.latency !== null);
      const averageLatency = successful.length
        ? Math.round(successful.reduce((sum, item) => sum + (item.latency || 0), 0) / successful.length)
        : null;

      return {
        host,
        port,
        mode: 'tcp-connect',
        attempts,
        averageLatency,
      };
    }

    case 'port-scan': {
      const { host } = getHostAndPort(getString(payload, 'host'));
      const ports = parsePortExpression(getString(payload, 'ports'));
      await assertPublicTarget(host);
      const results = await Promise.all(ports.map((port) => probePort(host, port, 850)));
      return {
        host,
        results,
        openPorts: results.filter((item) => item.open).map((item) => item.port),
      };
    }

    case 'url-status': {
      const url = normalizeUrl(getString(payload, 'url'));
      await assertPublicTarget(url.hostname);

      let response = await fetchWithTimeout(url.toString(), { method: 'HEAD', redirect: 'follow' }, 12000);
      if (response.status === 405 || response.status === 403) {
        response = await fetchWithTimeout(url.toString(), { method: 'GET', redirect: 'follow' }, 12000);
      }

      return {
        url: url.toString(),
        finalUrl: response.url || url.toString(),
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        contentType: response.headers.get('content-type') || '',
        contentLength: response.headers.get('content-length') || '',
        server: response.headers.get('server') || '',
      };
    }

    case 'web-metadata': {
      const url = normalizeUrl(getString(payload, 'url'));
      const { html, finalUrl, status, contentType } = await readPage(url);
      return {
        url: finalUrl,
        status,
        contentType,
        ...extractMetadata(html, finalUrl),
      };
    }

    case 'web-images': {
      const url = normalizeUrl(getString(payload, 'url'));
      const { html, finalUrl } = await readPage(url);
      return {
        url: finalUrl,
        images: extractPageImages(html, finalUrl),
      };
    }

    case 'web-markdown': {
      const url = normalizeUrl(getString(payload, 'url'));
      const { html, finalUrl } = await readPage(url);
      return {
        url: finalUrl,
        markdown: convertHtmlToMarkdown(html),
      };
    }

    case 'llms-txt': {
      const inputUrl = normalizeUrl(getString(payload, 'url'));
      const { html, finalUrl } = await readPage(inputUrl);
      const siteOrigin = new URL(finalUrl).origin;
      const metadata = extractMetadata(html, finalUrl);
      const language = extractDocumentLanguage(html);
      const homeLinks = extractHomepageLinks(html, finalUrl);
      const rssUrl = extractRssUrl(html, finalUrl);
      const robots = await readRobotsFile(siteOrigin);
      const sitemap = await discoverSitemap(siteOrigin, robots);
      const sitemapLinks = buildSitemapCandidates(sitemap.urls);
      const primarySections = selectPrimarySections(homeLinks, sitemapLinks, siteOrigin);
      const examplePages = selectExamplePages(primarySections, sitemapLinks, homeLinks);
      const siteTitle = metadata.openGraph.siteName || metadata.title || new URL(siteOrigin).hostname;
      const siteUrl = metadata.canonical || siteOrigin;
      const description = metadata.description || '';
      const generated = buildLlmsDocument({
        siteTitle,
        siteUrl,
        description,
        language,
        primarySections,
        examplePages,
        robots,
        sitemap,
        rssUrl,
      }).join('\n');

      return {
        siteTitle,
        siteUrl,
        language,
        description,
        homepage: finalUrl,
        robots,
        sitemap,
        rssUrl,
        primarySections: primarySections.map(({ label, url, path, source }) => ({ label, url, path, source })),
        examplePages: examplePages.map(({ label, url, path, source }) => ({ label, url, path, source })),
        generated,
      };
    }

    case 'minecraft-player': {
      const username = getString(payload, 'username');
      if (!username) throw new Error('请输入 Minecraft 玩家名。');

      const profileRes = await fetchWithTimeout(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`, {}, 10000);
      if (!profileRes.ok) throw new Error('未找到该玩家。');
      const profile = await profileRes.json();

      const sessionRes = await fetchWithTimeout(
        `https://sessionserver.mojang.com/session/minecraft/profile/${profile.id}`,
        {},
        10000
      );
      const session = sessionRes.ok ? await sessionRes.json() : null;
      const textures = decodeMinecraftTexture(session?.properties?.find((item: { name: string }) => item.name === 'textures')?.value);
      const skinUrl = textures?.textures?.SKIN?.url || `https://crafatar.com/skins/${profile.id}`;
      const capeUrl = textures?.textures?.CAPE?.url || '';

      return {
        id: profile.id,
        username: profile.name,
        skinUrl,
        capeUrl,
        avatarUrl: `https://crafatar.com/avatars/${profile.id}?size=128&overlay`,
      };
    }

    case 'minecraft-server': {
      const address = getString(payload, 'address');
      const edition = getString(payload, 'edition', 'java') === 'bedrock' ? 'bedrock' : 'java';
      if (!address) throw new Error('请输入服务器地址。');
      const { host } = getHostAndPort(address, edition === 'bedrock' ? 19132 : 25565);
      await assertPublicTarget(host);

      const response = await fetchWithTimeout(
        `https://api.mcstatus.io/v2/status/${edition}/${encodeURIComponent(address)}`,
        {},
        12000
      );
      if (!response.ok) throw new Error('服务器状态查询失败。');
      const data = await response.json();
      return {
        edition,
        address,
        data,
      };
    }

    case 'github-repo': {
      const raw = getString(payload, 'repo');
      if (!raw) throw new Error('请输入仓库地址或 owner/repo。');
      const match = raw.match(/github\.com\/([^/]+)\/([^/#?]+)/i) || raw.match(/^([^/\s]+)\/([^/\s]+)$/);
      if (!match) throw new Error('仓库格式应为 owner/repo 或 GitHub URL。');
      const owner = match[1];
      const repo = match[2].replace(/\.git$/i, '');

      const repoResponse = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!repoResponse.ok) throw new Error('仓库不存在或 GitHub 请求失败。');
      const repoData = await repoResponse.json();

      const languagesResponse = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      const languages = languagesResponse.ok ? await languagesResponse.json() : {};

      return {
        owner,
        repo,
        fullName: repoData.full_name,
        description: repoData.description,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        watchers: repoData.watchers_count,
        openIssues: repoData.open_issues_count,
        defaultBranch: repoData.default_branch,
        language: repoData.language,
        visibility: repoData.visibility,
        license: repoData.license?.name || '',
        updatedAt: repoData.updated_at,
        homepage: repoData.homepage || '',
        topics: repoData.topics || [],
        languages,
        url: repoData.html_url,
      };
    }

    case 'gravatar': {
      const email = getString(payload, 'email').toLowerCase();
      if (!email) throw new Error('请输入邮箱地址。');
      const hash = md5(email);
      const size = Math.min(Math.max(getNumber(payload, 'size', 256), 32), 1024);
      return {
        email,
        hash,
        avatarUrl: `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`,
        profileUrl: `https://www.gravatar.com/${hash}`,
      };
    }

    case 'ip-geo': {
      const ip = getString(payload, 'ip') || resolveClientIp(requestHeaders);
      const record = loadGeoIpModule().lookup(ip);
      return {
        ip,
        found: Boolean(record),
        country: record?.country || '',
        region: record?.region || '',
        city: record?.city || '',
        timezone: record?.timezone || '',
        coordinates: record?.ll || [],
      };
    }

    case 'mobile-area': {
      const phone = getString(payload, 'phone').replace(/\s+/g, '');
      if (!/^1\d{10}$/.test(phone)) throw new Error('请输入 11 位中国大陆手机号。');
      const record = loadMobileAreaModule()(phone);
      return {
        phone,
        found: Boolean(record),
        province: record?.province || '',
        city: record?.city || '',
        carrier: record?.type || '',
      };
    }

    case 'bing-wallpaper': {
      const market = getString(payload, 'market', 'zh-CN') || 'zh-CN';
      const response = await fetchWithTimeout(
        `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=${encodeURIComponent(market)}`,
        {
          headers: { Accept: 'application/json' },
        },
        10000
      );
      if (!response.ok) throw new Error('Bing 壁纸接口请求失败。');
      const data = await response.json();
      const image = data.images?.[0];
      if (!image) throw new Error('未获取到壁纸。');
      return {
        market,
        title: image.title || image.bsTitle || 'Bing Wallpaper',
        copyright: image.copyright || '',
        startDate: image.startdate || '',
        url: `https://www.bing.com${image.url}`,
      };
    }

    case 'answer-book': {
      const question = getString(payload, 'question');
      return {
        question,
        answer: pickRandom(ANSWER_BOOK_ENTRIES),
      };
    }

    case 'poetry': {
      try {
        const response = await fetchWithTimeout('https://v1.jinrishici.com/all.json', { headers: { Accept: 'application/json' } }, 10000);
        if (response.ok) {
          const data = await response.json();
          return {
            source: 'jinrishici',
            title: data.origin || '',
            author: data.author || '',
            dynasty: data.category || '',
            content: data.content || '',
          };
        }
      } catch {
        // fall through to local fallback
      }

      const fallback = pickRandom(FALLBACK_POEMS);
      return { source: 'local', ...fallback };
    }

    case 'history-today': {
      const now = new Date();
      const month = String(getNumber(payload, 'month', now.getMonth() + 1)).padStart(2, '0');
      const day = String(getNumber(payload, 'day', now.getDate())).padStart(2, '0');

      try {
        const response = await fetchWithTimeout(
          `https://api.wikimedia.org/feed/v1/wikipedia/zh/onthisday/all/${month}/${day}`,
          { headers: { Accept: 'application/json' } },
          10000
        );

        if (response.ok) {
          const data = await response.json();
          return {
            source: 'wikimedia',
            date: `${month}-${day}`,
            events: (data?.events || []).slice(0, 12).map((item: { year: number; text: string }) => ({
              year: String(item.year),
              text: item.text,
            })),
          };
        }
      } catch {
        // fall through to local fallback
      }

      return {
        source: 'local',
        date: `${month}-${day}`,
        events: FALLBACK_HISTORY_EVENTS,
      };
    }

    default:
      throw new Error(`暂不支持的工具：${tool}`);
  }
}

export async function runServerTool(tool: string, payload: ToolPayload, requestHeaders: Headers) {
  return runToolInternal(tool, payload, requestHeaders);
}
