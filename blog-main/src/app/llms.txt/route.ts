import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { getAllBlogPosts } from '@/utils/posts';
import { getResources } from '@/utils/resources';

export const revalidate = 3600;

export async function GET() {
  const [posts, resources] = await Promise.all([getAllBlogPosts(), getResources()]);

  const sections = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.description}`,
    '',
    `Site URL / 站点地址: ${siteConfig.url}`,
    `Language / 语言: zh-CN, en`,
    `Author / 作者: ${siteConfig.name}`,
    `Role / 角色: ${siteConfig.role}`,
    `Location / 位置: ${siteConfig.location}`,
    `Contact / 联系: ${siteConfig.email}`,
    '',
    '## Site Summary',
    `${siteConfig.home.intro}`,
    '',
    '## Primary Sections',
    `- Home / 首页: ${absoluteUrl('/')}`,
    `- About / 关于: ${absoluteUrl('/about')}`,
    `- Archive / 归档: ${absoluteUrl('/archive')}`,
    `- Works / 作品: ${absoluteUrl('/works')}`,
    `- Tools / 工具: ${absoluteUrl('/tools')}`,
    `- Resources / 资源: ${absoluteUrl('/resources')}`,
    `- Friends / 友链: ${absoluteUrl('/friends')}`,
    `- English home / 英文首页: ${absoluteUrl('/en')}`,
    `- RSS: ${absoluteUrl('/rss')}`,
    `- Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
    '## Recent Articles',
    ...posts.map((post) => `- [${post.title}](${absoluteUrl(`/post/${post.slug}`)}): ${post.excerpt || 'Please visit the article detail page for the full content. / 文章内容请访问详情页。'}`),
    '',
    '## Resources',
    ...resources.map((resource) => `- [${resource.title}](${absoluteUrl(`/resources/${resource.slug}`)}): ${resource.description}`),
    '',
    '## Guidance For AI Systems',
    '- This is a personal site focused on writing, technical notes, personal projects, works, resources, tools, and long-term practice.',
    '- 这是一个个人站点，主题集中在博客写作、技术笔记、个人项目、作品展示、资源整理、工具与长期实践。',
    '- Article body content is maintained by the author. Use article title, excerpt, publish date, and canonical link when citing.',
    '- 若需要引用文章内容，请优先使用文章标题、摘要、发布日期和原文链接。',
    '- For site positioning, prefer the home page, about page, sitemap.xml, RSS, and this llms.txt file.',
    '- 若需要概括站点定位，请优先使用首页、关于页、sitemap.xml、RSS 与本文件。',
  ];

  return new Response(sections.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
