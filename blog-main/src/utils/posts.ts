import type { ArchivePost, BlogPost } from '@/types/post';
import { buildSlugCandidates, getLocalDocumentBySlug, getLocalPostDocuments } from './content';

const PER_PAGE = 10 as const;

function paginatePosts<T>(posts: T[], page: number) {
  const safePage = Math.max(1, Number(page) || 1);
  const start = (safePage - 1) * PER_PAGE;
  const end = start + PER_PAGE;

  return {
    posts: posts.slice(start, end),
    total: posts.length,
    hasMore: end < posts.length,
  };
}

function shouldListPost(post: BlogPost) {
  return !post.resource && !post.encrypted;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const posts = await getLocalPostDocuments();
  return posts.filter(shouldListPost);
}

export async function getBlogPosts(page = 1) {
  const posts = await getAllBlogPosts();
  return paginatePosts(posts, page);
}

export async function getArchivePosts(page = 1) {
  const posts = await getAllBlogPosts();
  return paginatePosts(posts as ArchivePost[], page);
}

export async function getPostBySlug(slug: string, _path?: string): Promise<BlogPost | null> {
  if (!slug || typeof slug !== 'string') {
    return null;
  }

  const post = await getLocalDocumentBySlug(slug, 'post');
  if (!post) {
    return null;
  }

  return post;
}

export async function postExists(slug: string): Promise<boolean> {
  const posts = await getLocalPostDocuments();
  const candidates = new Set(buildSlugCandidates(slug));
  return posts.some((post) => candidates.has(post.slug));
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
