import { buildSlugCandidates, getLocalDocumentBySlug, getLocalResourceDocuments, toDisplayDate } from './content';

export interface Resource {
  slug: string;
  title: string;
  description: string;
  type: string;
  format?: string;
  size?: string;
  tags: string[];
  downloadUrl?: string;
  lastUpdated?: string;
  date?: string;
  details: Record<string, string>;
  sample?: string;
  usage: string[];
}

export async function getResources(): Promise<Resource[]> {
  const resources = await getLocalResourceDocuments();

  return resources.map((resource) => ({
    slug: resource.slug,
    title: resource.title,
    description: resource.excerpt || '',
    type: resource.resourceType || '文档',
    format: resource.format,
    size: resource.size,
    tags: resource.tags || [],
    downloadUrl: resource.downloadUrl,
    lastUpdated: resource.date ? toDisplayDate(resource.date) : undefined,
    date: resource.date,
    details: resource.resourceDetails || {},
    sample: resource.content,
    usage: resource.usage || [],
  }));
}

export async function getResourceBySlug(slug: string): Promise<Resource | null> {
  const resource = await getLocalDocumentBySlug(slug, 'resource');
  if (!resource) {
    return null;
  }

  const candidates = new Set(buildSlugCandidates(slug));
  if (!candidates.has(resource.slug)) {
    return null;
  }

  return {
    slug: resource.slug,
    title: resource.title,
    description: resource.excerpt || '',
    type: resource.resourceType || '文档',
    format: resource.format,
    size: resource.size,
    tags: resource.tags || [],
    downloadUrl: resource.downloadUrl,
    lastUpdated: resource.date ? toDisplayDate(resource.date) : undefined,
    date: resource.date,
    details: resource.resourceDetails || {},
    sample: resource.content,
    usage: resource.usage || [],
  };
}
