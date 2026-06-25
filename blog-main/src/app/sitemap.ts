import type { MetadataRoute } from 'next';
import { localizePath } from '@/lib/i18n';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { toolCatalog, toolHref } from '@/lib/tools/catalog';
import { getAllBlogPosts } from '@/utils/posts';
import { getResources } from '@/utils/resources';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, resources] = await Promise.all([getAllBlogPosts(), getResources()]);
  const now = new Date();

  const withAlternates = (path: string) => ({
    languages: {
      'zh-CN': absoluteUrl(localizePath(path, 'zh-CN')),
      en: absoluteUrl(localizePath(path, 'en')),
    },
  });

  const staticPaths = [
    '/',
    '/about',
    '/archive',
    '/works',
    '/tools',
    '/tools/seo',
    '/tools/local',
    '/tools/image',
    '/tools/calc',
    '/tools/chinese',
    '/tools/css',
    '/tools/network',
    '/tools/data',
    '/resources',
    '/friends',
    '/pricing',
    '/privacy',
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.flatMap((path) => [
    {
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/archive' || path === '/resources' ? 0.9 : 0.8,
    alternates: withAlternates(path),
  },
    {
      url: absoluteUrl(localizePath(path, 'en')),
      lastModified: now,
      changeFrequency: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1 : path === '/archive' || path === '/resources' ? 0.9 : 0.8,
      alternates: withAlternates(path),
    },
  ]);

  const toolRoutes: MetadataRoute.Sitemap = toolCatalog.flatMap((tool) => {
    const path = toolHref(tool.id);
    return [
      {
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: withAlternates(path),
      },
      {
        url: absoluteUrl(localizePath(path, 'en')),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: withAlternates(path),
      },
    ];
  });

  const postRoutes: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const path = `/post/${post.slug}`;
    return [{
    url: absoluteUrl(path),
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
    alternates: withAlternates(path),
  },
  {
    url: absoluteUrl(localizePath(path, 'en')),
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: withAlternates(path),
  }];
  });

  const resourceRoutes: MetadataRoute.Sitemap = resources.flatMap((resource) => {
    const path = `/resources/${resource.slug}`;
    return [{
    url: absoluteUrl(path),
    lastModified: resource.date ? new Date(resource.date) : now,
    changeFrequency: 'monthly',
    priority: 0.75,
    alternates: withAlternates(path),
  },
  {
    url: absoluteUrl(localizePath(path, 'en')),
    lastModified: resource.date ? new Date(resource.date) : now,
    changeFrequency: 'monthly',
    priority: 0.65,
    alternates: withAlternates(path),
  }];
  });

  return [...staticRoutes, ...toolRoutes, ...postRoutes, ...resourceRoutes];
}
