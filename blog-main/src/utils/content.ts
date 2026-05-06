import { promises as fs } from 'fs';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import path from 'path';
import type { BlogPost } from '@/types/post';
import { resolveAuthorProfile } from './author-profile';
import { generateExcerpt } from './excerpt-generator';
import { markdownToHtml } from './markdown';
import { hashPostPassword } from './post-encryption';
import { slugify } from './slug';

const CONTENT_ROOT = path.join(process.cwd(), 'content');
const POSTS_ROOT = path.join(CONTENT_ROOT, 'posts');
const RESOURCES_ROOT = path.join(CONTENT_ROOT, 'resources');
const SUPPORTED_EXTENSIONS = new Set(['.md', '.mdx']);

export type LocalContentKind = 'post' | 'resource';

export interface LocalContentDocument extends BlogPost {
  kind: LocalContentKind;
  filePath: string;
  plainText: string;
}

interface Frontmatter {
  slug?: string;
  title?: string;
  date?: string | Date;
  excerpt?: string;
  coverImage?: string;
  author?: string;
  authorAvatar?: string;
  category?: string;
  tags?: string[] | string;
  encrypt?: string;
  type?: string;
  resourceType?: string;
  format?: string;
  size?: string;
  downloadUrl?: string;
  resourceDetails?: Record<string, unknown>;
  details?: Record<string, unknown>;
  usage?: string[] | string;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item)).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(Object.entries(value).map(([key, recordValue]) => [key, String(recordValue ?? '')]));
}

function resolveIsoDate(value: unknown, fallbackDate: Date): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  const rawValue = normalizeString(value);
  if (!rawValue) {
    return fallbackDate.toISOString();
  }

  const parsedDate = new Date(rawValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallbackDate.toISOString();
  }

  return parsedDate.toISOString();
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function inferCategory(relativePathWithoutExtension: string, kind: LocalContentKind): string | undefined {
  const segments = relativePathWithoutExtension.split(path.sep).filter(Boolean);

  if (segments.length <= 1) {
    return kind === 'resource' ? '资源' : '未分类';
  }

  return segments
    .slice(0, -1)
    .map((segment) => segment.replace(/[-_]/g, ' ').trim())
    .filter(Boolean)
    .join(' / ');
}

function calculateWordCount(markdown: string): number {
  if (!markdown || markdown.trim().length === 0) {
    return 0;
  }

  let text = markdown.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  text = text.replace(/^#{1,6}\s+/gm, '');
  text = text.replace(/[*_~`]/g, '');
  text = text.replace(/^[-*+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/\s+/g, ' ').trim();

  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  const englishWords = text.match(/[a-zA-Z]+/g) || [];

  return chineseChars.length + englishWords.length;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, ' ')
    .replace(/!\[\[[^\]]+\]\]/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+.+$/gm, ' ')
    .replace(/[#*_~>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function collectMarkdownFiles(rootDir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(rootDir, { withFileTypes: true });
    const nestedFiles = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(rootDir, entry.name);

        if (entry.isDirectory()) {
          return collectMarkdownFiles(fullPath);
        }

        if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
          return [fullPath];
        }

        return [];
      })
    );

    return nestedFiles.flat();
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function readLocalDocument(
  filePath: string,
  rootDir: string,
  kind: LocalContentKind
): Promise<LocalContentDocument> {
  const [fileContents, fileStats] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);
  const parsed = matter(fileContents, {
    engines: {
      yaml: (value: string) => yaml.load(value) as Frontmatter,
    },
  });

  const frontmatter = (parsed.data ?? {}) as Frontmatter;
  const relativePath = path.relative(rootDir, filePath);
  const relativePathWithoutExtension = relativePath.replace(path.extname(relativePath), '');
  const fileName = path.basename(filePath, path.extname(filePath));
  const slugSource = normalizeString(frontmatter.slug) || relativePathWithoutExtension.split(path.sep).join('-');
  const slug = slugify(slugSource);
  const date = resolveIsoDate(frontmatter.date, fileStats.mtime);
  const coverImage = normalizeString(frontmatter.coverImage) || null;
  const excerpt = generateExcerpt(parsed.content, normalizeString(frontmatter.excerpt) || undefined);
  const wordCount = calculateWordCount(parsed.content);
  const plainText = stripMarkdown(parsed.content);
  const html = await markdownToHtml(parsed.content);
  const tags = normalizeStringArray(frontmatter.tags);
  const encryptValue = normalizeString(frontmatter.encrypt);
  const authorProfile = resolveAuthorProfile(frontmatter.author, frontmatter.authorAvatar);

  return {
    slug,
    title: normalizeString(frontmatter.title) || fileName,
    date,
    content: html,
    excerpt,
    wordCount,
    coverImage,
    author: authorProfile.name,
    authorAvatar: authorProfile.avatar,
    encrypted: encryptValue.length > 0,
    encryption: encryptValue ? { hash: hashPostPassword(slug, encryptValue) } : undefined,
    tags,
    category: normalizeString(frontmatter.category) || inferCategory(relativePathWithoutExtension, kind),
    source: 'local',
    resource: kind === 'resource',
    resourceType:
      kind === 'resource'
        ? normalizeString(frontmatter.type) || normalizeString(frontmatter.resourceType) || '文档'
        : undefined,
    format: kind === 'resource' ? normalizeString(frontmatter.format) || undefined : undefined,
    size: kind === 'resource' ? normalizeString(frontmatter.size) || undefined : undefined,
    downloadUrl: kind === 'resource' ? normalizeString(frontmatter.downloadUrl) || undefined : undefined,
    resourceDetails:
      kind === 'resource' ? normalizeStringRecord(frontmatter.resourceDetails ?? frontmatter.details) : undefined,
    usage: kind === 'resource' ? normalizeStringArray(frontmatter.usage) : undefined,
    kind,
    filePath,
    plainText,
  };
}

async function readLocalDocuments(rootDir: string, kind: LocalContentKind): Promise<LocalContentDocument[]> {
  const files = await collectMarkdownFiles(rootDir);
  const documents = await Promise.all(files.map((filePath) => readLocalDocument(filePath, rootDir, kind)));

  return documents.sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

export async function getLocalPostDocuments(): Promise<LocalContentDocument[]> {
  return readLocalDocuments(POSTS_ROOT, 'post');
}

export async function getLocalResourceDocuments(): Promise<LocalContentDocument[]> {
  return readLocalDocuments(RESOURCES_ROOT, 'resource');
}

export async function getAllLocalDocuments(): Promise<LocalContentDocument[]> {
  const [posts, resources] = await Promise.all([getLocalPostDocuments(), getLocalResourceDocuments()]);
  return [...posts, ...resources].sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());
}

export function buildSlugCandidates(slug: string): string[] {
  const candidates = new Set<string>();

  const addCandidate = (value?: string | null) => {
    const normalizedValue = normalizeString(value);
    if (!normalizedValue) {
      return;
    }

    candidates.add(normalizedValue);
    candidates.add(slugify(normalizedValue));
  };

  addCandidate(slug);

  try {
    addCandidate(decodeURIComponent(slug));
  } catch {
    // Ignore invalid URI sequences and keep the original slug only.
  }

  return Array.from(candidates);
}

export async function getLocalDocumentBySlug(
  slug: string,
  kind?: LocalContentKind
): Promise<LocalContentDocument | null> {
  const documents =
    kind === 'post'
      ? await getLocalPostDocuments()
      : kind === 'resource'
        ? await getLocalResourceDocuments()
        : await getAllLocalDocuments();

  const candidates = new Set(buildSlugCandidates(slug));
  return documents.find((document) => candidates.has(document.slug)) ?? null;
}

export function toDisplayDate(dateString: string): string {
  return formatDisplayDate(dateString);
}
