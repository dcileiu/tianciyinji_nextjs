import Script from 'next/script';

interface StructuredDataProps {
  type?: 'website' | 'person' | 'article' | 'blog';
  data?: Record<string, unknown>;
}

export default function StructuredData({ type = 'website', data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
    };

    switch (type) {
      case 'website':
        return {
          ...baseData,
          '@type': 'WebSite',
          name: "Tianci's Portfolio",
          description: '欢迎来到Tianci的个人网站！这里分享前端开发技术、项目作品和技术博客。',
          url: 'https://itianci.cn',
          author: {
            '@type': 'Person',
            name: 'Tianci',
            url: 'https://github.com/tianci',
            jobTitle: '前端开发工程师',
            knowsAbout: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://itianci.cn/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
          sameAs: [
            'https://github.com/tianci',
            // Add other social media profiles here
          ],
        };

      case 'person':
        return {
          ...baseData,
          '@type': 'Person',
          name: 'Tianci',
          jobTitle: '前端开发工程师',
          description: '专注于React、Next.js、TypeScript等现代Web开发技术的前端开发者',
          url: 'https://itianci.cn',
          image: 'https://itianci.cn/profile-image.jpg',
          knowsAbout: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Web Development'],
          alumniOf: {
            '@type': 'EducationalOrganization',
            name: '您的大学名称',
          },
          sameAs: [
            'https://github.com/tianci',
            // Add other social media profiles
          ],
          ...data,
        };

      case 'blog':
        return {
          ...baseData,
          '@type': 'Blog',
          name: "Tianci's Tech Blog",
          description: '分享前端开发技术文章，包括React、Next.js、TypeScript等现代Web开发技术。',
          url: 'https://itianci.cn/blog',
          author: {
            '@type': 'Person',
            name: 'Tianci',
          },
          publisher: {
            '@type': 'Person',
            name: 'Tianci',
          },
          inLanguage: 'zh-CN',
          ...data,
        };

      case 'article':
        return {
          ...baseData,
          '@type': 'Article',
          headline: data?.title || '技术文章',
          description: data?.description || '前端开发技术文章',
          author: {
            '@type': 'Person',
            name: 'Tianci',
          },
          publisher: {
            '@type': 'Person',
            name: 'Tianci',
          },
          datePublished: data?.publishedAt || new Date().toISOString(),
          dateModified: data?.updatedAt || new Date().toISOString(),
          image: data?.image || 'https://itianci.cn/og-image.jpg',
          url: data?.url || 'https://itianci.cn',
          inLanguage: 'zh-CN',
          ...data,
        };

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