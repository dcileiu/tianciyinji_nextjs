import RSS from 'rss';
import { siteConfig } from '@/lib/site-config';
import { getAllBlogPosts } from '@/utils/posts';
import { getResources } from '@/utils/resources';

export async function GET() {
  const posts = await getAllBlogPosts();
  const resources = await getResources();
  const siteUrl = siteConfig.url;

  const feed = new RSS({
    title: siteConfig.name,
    description: siteConfig.description,
    site_url: siteUrl,
    feed_url: `${siteUrl}/rss`,
    language: 'zh-CN',
    pubDate: new Date(),
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt || '',
      url: `${siteUrl}/post/${post.slug}`,
      date: new Date(post.date),
      categories: post.tags || [],
      author: siteConfig.name,
    });
  });

  resources
    .filter((resource) => resource.type !== 'command')
    .forEach((resource) => {
      feed.item({
        title: `[资源] ${resource.title}`,
        description: resource.description || '',
        url: `${siteUrl}/resources/${resource.slug}`,
        date: resource.date ? new Date(resource.date) : new Date(),
        categories: resource.tags || [],
        author: siteConfig.name,
      });
    });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
