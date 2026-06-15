'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import {
  sectionMeta,
  segmentBySectionId,
  toolCatalog,
  toolHref,
  toolNavMenuGroups,
  type ToolNavEntry,
  type SectionId,
} from '@/lib/tools/catalog';
import { cn } from '@/lib/utils';

type Dictionary = ReturnType<typeof import('@/lib/i18n').getDictionary>;

interface NavToolLink {
  key: string;
  label: string;
  href: string;
}

interface NavToolGroup {
  id: string;
  label: string;
  tools: NavToolLink[];
  sectionHref?: string;
}

function resolveEntryLabel(entry: ToolNavEntry, dictionary: Dictionary): string {
  const navMenu = dictionary.toolsPage.navMenu as Record<string, string | undefined>;
  const toolTitles = dictionary.toolsPage.toolTitles as Record<string, string | undefined>;

  if (entry.kind === 'page') {
    if (entry.labelKey.startsWith('section.')) {
      return resolveGroupLabel(entry.labelKey, dictionary);
    }
    return navMenu[entry.labelKey] ?? entry.labelKey;
  }
  return toolTitles[entry.id] ?? entry.id;
}

function resolveEntryHref(entry: ToolNavEntry): string {
  return entry.kind === 'page' ? entry.href : toolHref(entry.id);
}

function resolveGroupLabel(labelKey: string, dictionary: Dictionary): string {
  const navMenu = dictionary.toolsPage.navMenu as Record<string, string | undefined>;
  if (labelKey.startsWith('section.')) {
    const sectionId = labelKey.slice('section.'.length);
    const sections = dictionary.toolsPage.sections as Record<string, { title: string } | undefined>;
    return sections[sectionId]?.title ?? sectionId;
  }
  return navMenu[labelKey] ?? labelKey;
}

function buildFeaturedGroups(dictionary: Dictionary): NavToolGroup[] {
  return toolNavMenuGroups.map((group) => ({
    id: group.id,
    label: resolveGroupLabel(group.labelKey, dictionary),
    tools: group.entries.map((entry) => ({
      key: entry.kind === 'page' ? entry.href : entry.id,
      label: resolveEntryLabel(entry, dictionary),
      href: resolveEntryHref(entry),
    })),
  }));
}

function buildAllSectionGroups(dictionary: Dictionary): NavToolGroup[] {
  const sections = dictionary.toolsPage.sections as Record<string, { title: string } | undefined>;
  const toolTitles = dictionary.toolsPage.toolTitles as Record<string, string | undefined>;

  return sectionMeta.map((section) => ({
    id: section.id,
    label: sections[section.id]?.title ?? section.id,
    sectionHref: `/tools/${segmentBySectionId[section.id as SectionId]}`,
    tools: toolCatalog
      .filter((tool) => tool.sectionId === section.id)
      .map((tool) => ({
        key: tool.id,
        label: toolTitles[tool.id] ?? tool.id,
        href: toolHref(tool.id),
      })),
  }));
}

function mergeSearchPool(...groupLists: NavToolGroup[][]): NavToolLink[] {
  const map = new Map<string, NavToolLink>();
  for (const groups of groupLists) {
    for (const group of groups) {
      for (const tool of group.tools) {
        map.set(tool.href, tool);
      }
    }
  }
  return [...map.values()];
}

function splitGroupsIntoColumns(groups: NavToolGroup[]): [NavToolGroup[], NavToolGroup[]] {
  const columns: [NavToolGroup[], NavToolGroup[]] = [[], []];
  const heights = [0, 0];

  for (const group of groups) {
    const estimatedHeight = group.tools.length + 1;
    const targetColumn = heights[0] <= heights[1] ? 0 : 1;
    columns[targetColumn].push(group);
    heights[targetColumn] += estimatedHeight;
  }

  return columns;
}

interface ToolsNavSubmenuProps {
  variant?: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

export function ToolsNavSubmenu({ variant = 'desktop', onNavigate }: ToolsNavSubmenuProps) {
  const { dictionary, localizedHref } = useI18n();
  const navMenu = dictionary.toolsPage.navMenu as {
    searchPlaceholder: string;
    noResults: string;
    allTools: string;
  };
  const [query, setQuery] = useState('');

  const featuredGroups = useMemo(() => buildFeaturedGroups(dictionary), [dictionary]);
  const allSectionGroups = useMemo(() => buildAllSectionGroups(dictionary), [dictionary]);
  const featuredColumns = useMemo(() => splitGroupsIntoColumns(featuredGroups), [featuredGroups]);
  const allSectionColumns = useMemo(() => splitGroupsIntoColumns(allSectionGroups), [allSectionGroups]);

  const searchPool = useMemo(
    () => mergeSearchPool(featuredGroups, allSectionGroups),
    [featuredGroups, allSectionGroups],
  );

  const filteredTools = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return null;
    return searchPool.filter((tool) => tool.label.toLowerCase().includes(trimmed));
  }, [query, searchPool]);

  const isMobile = variant === 'mobile';
  const linkClass = isMobile
    ? 'block rounded-lg px-3 py-2 text-base font-medium text-foreground/75 hover:bg-accent hover:text-foreground transition-colors duration-200'
    : 'block rounded-lg px-2.5 py-1.5 text-sm text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors duration-150';

  const renderToolLink = (tool: NavToolLink) => (
    <li key={tool.key}>
      <Link
        href={localizedHref(tool.href) as any}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate?.();
        }}
        className={linkClass}
      >
        {tool.label}
      </Link>
    </li>
  );

  const renderGroup = (group: NavToolGroup) => (
    <li key={group.id} className={cn(isMobile ? 'mt-3 first:mt-0' : 'min-w-0')}>
      {group.sectionHref ? (
        <Link
          href={localizedHref(group.sectionHref) as any}
          onClick={(e) => {
            e.stopPropagation();
            onNavigate?.();
          }}
          className={cn(
            'block font-semibold uppercase tracking-wide text-foreground/45 hover:text-foreground/70 transition-colors',
            isMobile ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1.5 text-xs whitespace-nowrap',
          )}
        >
          {group.label}
        </Link>
      ) : (
        <span
          className={cn(
            'block select-none font-semibold uppercase tracking-wide text-foreground/45',
            isMobile ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1.5 text-xs whitespace-nowrap',
          )}
        >
          {group.label}
        </span>
      )}
      <ul className={cn('space-y-0.5', isMobile ? 'px-1' : '')}>
        {group.tools.map(renderToolLink)}
      </ul>
    </li>
  );

  const renderGroupColumns = (columns: [NavToolGroup[], NavToolGroup[]]) =>
    isMobile ? (
      <ul className="space-y-1">{columns.flat().map(renderGroup)}</ul>
    ) : (
      <div className="grid grid-cols-2 gap-2">
        {columns.map((column, columnIndex) => (
          <ul key={columnIndex} className="min-w-0 space-y-2">
            {column.map(renderGroup)}
          </ul>
        ))}
      </div>
    );

  return (
    <div className={cn(isMobile ? 'space-y-2 px-1' : 'flex flex-col gap-2')}>
      <div className={cn(!isMobile && 'col-span-2')}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder={navMenu.searchPlaceholder}
          className={cn(
            'w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm',
            'text-foreground placeholder:text-foreground/40',
            'outline-none focus:border-[#5b3df5]/40 focus:ring-2 focus:ring-[#5b3df5]/15',
          )}
        />
      </div>

      {filteredTools ? (
        filteredTools.length > 0 ? (
          <ul className={cn('grid grid-cols-2 gap-x-1 gap-y-0.5', !isMobile && 'col-span-2')}>
            {filteredTools.map(renderToolLink)}
          </ul>
        ) : (
          <p className={cn('px-2.5 py-2 text-sm text-foreground/45', !isMobile && 'col-span-2')}>
            {navMenu.noResults}
          </p>
        )
      ) : (
        <div className="space-y-3">
          {renderGroupColumns(featuredColumns)}
          <div
            className={cn(
              'border-t border-border/60 pt-2 text-xs font-semibold uppercase tracking-wide text-foreground/40',
              isMobile ? 'px-3' : 'px-2.5',
            )}
          >
            {navMenu.allTools}
          </div>
          {renderGroupColumns(allSectionColumns)}
        </div>
      )}
    </div>
  );
}
