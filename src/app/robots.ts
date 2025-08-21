import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://itianci.cn'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/private/*',
        ],
      },
      // Allow search engine crawlers to access CSS and JS
      {
        userAgent: '*',
        allow: [
          '*.css',
          '*.js',
          '*.svg',
          '*.png',
          '*.jpg',
          '*.jpeg',
          '*.gif',
          '*.webp',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
} 