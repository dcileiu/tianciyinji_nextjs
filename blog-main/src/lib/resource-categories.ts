import type { LucideIcon } from 'lucide-react';
import { BookOpen, Box, Cat, Clapperboard, Fan, Gamepad2, LayoutGrid, Music, Wrench } from 'lucide-react';
import type { Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/i18n';

export type ResourceCategoryId =
  | 'all'
  | 'film'
  | 'acgn'
  | 'music'
  | 'reading'
  | 'game'
  | 'entertainment'
  | 'toolbox'
  | 'software';

export interface ResourceCategory {
  id: ResourceCategoryId;
  icon: LucideIcon;
  aliases: string[];
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'all', icon: LayoutGrid, aliases: [] },
  { id: 'film', icon: Clapperboard, aliases: ['film', 'movie', 'tv', 'video', '影视'] },
  { id: 'acgn', icon: Cat, aliases: ['acgn', 'anime', 'manga', '二次元'] },
  { id: 'music', icon: Music, aliases: ['music', 'audio', '音乐'] },
  { id: 'reading', icon: BookOpen, aliases: ['reading', 'book', 'read', '阅读'] },
  { id: 'game', icon: Gamepad2, aliases: ['game', 'games', 'gaming', '游戏'] },
  {
    id: 'entertainment',
    icon: Fan,
    aliases: ['entertainment', 'fun', '娱乐'],
  },
  { id: 'toolbox', icon: Wrench, aliases: ['toolbox', 'tools', '工具箱', '工具'] },
  { id: 'software', icon: Box, aliases: ['software', 'app', 'apps', '软件'] },
];

export function getResourceCategoryLabel(categoryId: ResourceCategoryId, locale: Locale) {
  return getDictionary(locale).resourceCategories[categoryId];
}

export function matchResourceCategory(resourceCategory: string | undefined, categoryId: ResourceCategoryId): boolean {
  if (categoryId === 'all') {
    return true;
  }

  const normalized = resourceCategory?.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const category = RESOURCE_CATEGORIES.find((item) => item.id === categoryId);
  if (!category) {
    return false;
  }

  return category.aliases.some((alias) => alias.toLowerCase() === normalized);
}
