import type { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { getAllBlogPosts } from '@/utils/posts';
import { getResources } from '@/utils/resources';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, resources] = await Promise.all([getAllBlogPosts(), getResources()]);
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/about',
    '/archive',
    '/works',
    '/tools',
    '/resources',
    '/friends',
    '/pricing',
    '/privacy',
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path === '/archive' || path === '/resources' ? 0.9 : 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/post/${post.slug}`),
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const resourceRoutes: MetadataRoute.Sitemap = resources.map((resource) => ({
    url: absoluteUrl(`/resources/${resource.slug}`),
    lastModified: resource.date ? new Date(resource.date) : now,
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...postRoutes, ...resourceRoutes];
}

