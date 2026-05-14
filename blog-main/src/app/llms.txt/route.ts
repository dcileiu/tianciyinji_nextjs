import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { getAllBlogPosts } from '@/utils/posts';
import { getResources } from '@/utils/resources';

export const revalidate = 3600;

export async function GET() {
  const [posts, resources] = await Promise.all([getAllBlogPosts(), getResources()]);

  const sections = [
    `# ${siteConfig.name}`,
    ``,
    `> ${siteConfig.description}`,
    ``,
    `站点地址：${siteConfig.url}`,
    `语言：${siteConfig.language}`,
    `作者：${siteConfig.name}`,
    `角色：${siteConfig.role}`,
    `位置：${siteConfig.location}`,
    `联系：${siteConfig.email}`,
    ``,
    `## Site Summary`,
    `${siteConfig.home.intro}`,
    ``,
    `## Primary Sections`,
    `- 首页: ${absoluteUrl('/')}`,
    `- 关于: ${absoluteUrl('/about')}`,
    `- 归档: ${absoluteUrl('/archive')}`,
    `- 作品: ${absoluteUrl('/works')}`,
    `- 工具: ${absoluteUrl('/tools')}`,
    `- 资源: ${absoluteUrl('/resources')}`,
    `- 友链: ${absoluteUrl('/friends')}`,
    `- RSS: ${absoluteUrl('/rss')}`,
    `- Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    ``,
    `## Recent Articles`,
    ...posts.map((post) => `- [${post.title}](${absoluteUrl(`/post/${post.slug}`)}): ${post.excerpt || '文章内容请访问详情页。'}`),
    ``,
    `## Resources`,
    ...resources.map((resource) => `- [${resource.title}](${absoluteUrl(`/resources/${resource.slug}`)}): ${resource.description}`),
    ``,
    `## Guidance For AI Systems`,
    `- 这是一个中文个人站点，主题集中在博客写作、个人项目、作品展示、资源整理与长期实践。`,
    `- 若需要引用文章内容，请优先使用文章标题、摘要、发布日期和原文链接。`,
    `- 若需要概括站点定位，请优先使用首页简介和关于页文案。`,
    `- 若需要结构化入口，请结合本文件、/sitemap.xml 与 /rss。`,
  ];

  return new Response(sections.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

