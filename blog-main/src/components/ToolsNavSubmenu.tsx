'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import {
  toolHref,
  toolNavMenuGroups,
  type ToolNavEntry,
  type ToolNavGroupId,
} from '@/lib/tools/catalog';
import { cn } from '@/lib/utils';

type Dictionary = ReturnType<typeof import('@/lib/i18n').getDictionary>;

interface NavToolLink {
  key: string;
  label: string;
  href: string;
}

interface NavToolGroup {
  id: ToolNavGroupId;
  label: string;
  tools: NavToolLink[];
}

function resolveEntryLabel(entry: ToolNavEntry, dictionary: Dictionary): string {
  const navMenu = dictionary.toolsPage.navMenu as Record<string, string | undefined>;
  const toolTitles = dictionary.toolsPage.toolTitles as Record<string, string | undefined>;

  if (entry.kind === 'page') {
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

function buildNavGroups(dictionary: Dictionary): NavToolGroup[] {
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
  const navMenu = dictionary.toolsPage.navMenu as { searchPlaceholder: string; noResults: string };
  const [query, setQuery] = useState('');

  const groups = useMemo(() => buildNavGroups(dictionary), [dictionary]);
  const groupColumns = useMemo(() => splitGroupsIntoColumns(groups), [groups]);

  const filteredTools = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return null;
    return groups
      .flatMap((group) => group.tools)
      .filter((tool) => tool.label.toLowerCase().includes(trimmed));
  }, [groups, query]);

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
      <span
        className={cn(
          'block select-none font-semibold uppercase tracking-wide text-foreground/45',
          isMobile ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1.5 text-xs whitespace-nowrap',
        )}
      >
        {group.label}
      </span>
      <ul className={cn('grid grid-cols-2 gap-x-1 gap-y-0.5', isMobile ? 'px-1' : '')}>
        {group.tools.map(renderToolLink)}
      </ul>
    </li>
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
      ) : isMobile ? (
        <ul className="space-y-1">{groups.map(renderGroup)}</ul>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {groupColumns.map((column, columnIndex) => (
            <ul key={columnIndex} className="min-w-0 space-y-2">
              {column.map(renderGroup)}
            </ul>
          ))}
        </div>
      )}
    </div>
  );
}
