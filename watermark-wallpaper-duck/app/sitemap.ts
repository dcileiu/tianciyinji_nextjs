import type { MetadataRoute } from 'next';
import {
  discoverAppRoutes,
  routeChangeFrequency,
  routePriority,
} from '@/lib/sitemap-routes';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = discoverAppRoutes();

  return routes.map((route) => ({
    url: route === '/' ? SITE_URL : `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: routeChangeFrequency(route),
    priority: routePriority(route),
  }));
}
