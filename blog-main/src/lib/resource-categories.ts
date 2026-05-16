import type { LucideIcon } from 'lucide-react';
import { BookOpen, Box, Cat, Clapperboard, Fan, Gamepad2, LayoutGrid, Music, Wrench } from 'lucide-react';

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
  label: string;
  icon: LucideIcon;
  aliases: string[];
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'all', label: '全部', icon: LayoutGrid, aliases: [] },
  { id: 'film', label: '影视', icon: Clapperboard, aliases: ['film', 'movie', 'tv', 'video', '影视'] },
  { id: 'acgn', label: '二次元', icon: Cat, aliases: ['acgn', 'anime', 'manga', '二次元'] },
  { id: 'music', label: '音乐', icon: Music, aliases: ['music', 'audio', '音乐'] },
  { id: 'reading', label: '阅读', icon: BookOpen, aliases: ['reading', 'book', 'read', '阅读'] },
  { id: 'game', label: '游戏', icon: Gamepad2, aliases: ['game', 'games', 'gaming', '游戏'] },
  {
    id: 'entertainment',
    label: '娱乐',
    icon: Fan,
    aliases: ['entertainment', 'fun', '娱乐'],
  },
  { id: 'toolbox', label: '工具箱', icon: Wrench, aliases: ['toolbox', 'tools', '工具箱', '工具'] },
  { id: 'software', label: '软件', icon: Box, aliases: ['software', 'app', 'apps', '软件'] },
];

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

  return category.aliases.some((alias) => alias.toLowerCase() === normalized) || category.label === resourceCategory;
}
