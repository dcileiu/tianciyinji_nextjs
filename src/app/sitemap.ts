import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://itianci.cn'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]
  
  // TODO: When you have a blog API, add dynamic blog posts here
  // Example:
  // const blogPosts = await fetch(`${baseUrl}/api/articles`).then(res => res.json())
  // const blogSitemapEntries = blogPosts.map((post: any) => ({
  //   url: `${baseUrl}/blog/${post.id}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }))
  
  return [
    ...staticPages,
    // ...blogSitemapEntries, // Uncomment when you have blog API
  ]
} 