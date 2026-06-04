'use client';

import { useMemo } from 'react';
import { useI18n } from '@/components/I18nProvider';

export type TagType = '经验分享' | '生活日志' | '杂谈' | '随笔' | '无标签';

interface TagProps {
  type: string;
}

// Tag颜色映射
const TAG_COLORS = {
  经验分享: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  生活日志: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  杂谈: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  随笔: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  无标签: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
} as const;

const TAG_LABEL_KEYS: Record<TagType, keyof ReturnType<typeof useI18n>['dictionary']['archive']['tagFilters']> = {
  经验分享: 'experienceShare',
  生活日志: 'lifeLog',
  杂谈: 'misc',
  随笔: 'essay',
  无标签: 'untagged',
};

// 验证tag是否合法
const isValidTag = (tag: string): tag is TagType => {
  return Object.keys(TAG_COLORS).includes(tag);
};

export default function Tag({ type }: TagProps) {
  const { dictionary } = useI18n();
  const labels = dictionary.archive.tagFilters;
  // 使用useMemo缓存tag验证结果
  const normalizedTag = useMemo(() => {
    return isValidTag(type) ? type : '无标签';
  }, [type]);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${TAG_COLORS[normalizedTag]}`}
    >
      {labels[TAG_LABEL_KEYS[normalizedTag]]}
    </span>
  );
}
