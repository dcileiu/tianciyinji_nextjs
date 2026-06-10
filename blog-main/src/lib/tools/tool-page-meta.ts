import type { Metadata } from 'next';
import { getDictionary, type Locale } from '@/lib/i18n';
import { buildCreativeWorkJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';
import { toolCatalog, type ToolId, type ToolSegment } from './catalog';

type ToolCopy = { title: string; description: string };

function getToolCopy(locale: Locale, toolId: ToolId): ToolCopy {
  const toolsPage = getDictionary(locale).toolsPage;
  const cards = toolsPage.cards as Record<string, ToolCopy | undefined>;
  const toolTitles = toolsPage.toolTitles as Record<string, string | undefined>;
  const sections = toolsPage.sections as Record<string, ToolCopy | undefined>;
  const card = cards[toolId];
  const sectionId = toolCatalog.find((tool) => tool.id === toolId)?.sectionId;
  const sectionDescription = sectionId ? sections[sectionId]?.description : undefined;
  return {
    title: card?.title ?? toolTitles[toolId] ?? toolId,
    description: card?.description ?? sectionDescription ?? '',
  };
}

export function buildToolMetadata(segment: ToolSegment, toolId: ToolId, locale: Locale): Metadata {
  const { title, description } = getToolCopy(locale, toolId);
  return buildPageMetadata({
    title: pageTitle(title),
    description,
    path: `/tools/${segment}/${toolId}`,
    keywords: [title],
    locale,
  });
}

export function buildToolJsonLd(segment: ToolSegment, toolId: ToolId, locale: Locale) {
  const { title, description } = getToolCopy(locale, toolId);
  return buildCreativeWorkJsonLd({
    title,
    description,
    path: `/tools/${segment}/${toolId}`,
    locale,
  });
}
