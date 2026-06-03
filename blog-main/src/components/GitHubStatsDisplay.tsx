'use client';

import { useI18n } from '@/components/I18nProvider';
import { getRepoStats, useGitHubStats } from '@/hooks/useGitHubStats';

interface GitHubStatsHeaderProps {
  fallbackStars?: number;
  fallbackUsers?: string;
  fallbackContributions?: number;
}

export function GitHubStatsHeader({
  fallbackStars = 476,
  fallbackUsers = '7,000+',
  fallbackContributions = 2132,
}: GitHubStatsHeaderProps) {
  const { locale } = useI18n();
  const { stats, isLoading } = useGitHubStats();

  const totalStars = stats?.totalStars ?? fallbackStars;
  const contributions = stats?.contributions ?? fallbackContributions;

  if (locale === 'en') {
    return (
      <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 sm:mb-8 leading-relaxed">
        I have earned <span className={isLoading ? 'opacity-50' : ''}>{totalStars.toLocaleString()}</span> stars in
        total. My projects are used by {fallbackUsers} users, and I contributed{' '}
        <span className={isLoading ? 'opacity-50' : ''}>{contributions.toLocaleString()}</span> times in the past
        year.
      </p>
    );
  }

  return (
    <p className="text-base sm:text-lg text-black/50 dark:text-white/50 mb-6 sm:mb-8 leading-relaxed">
      我一共获得了 <span className={isLoading ? 'opacity-50' : ''}>{totalStars.toLocaleString()}</span>{' '}
      颗星标，做的项目已经有 {fallbackUsers} 位用户在使用，过去一年贡献了{' '}
      <span className={isLoading ? 'opacity-50' : ''}>{contributions.toLocaleString()}</span> 次代码
    </p>
  );
}

export function RepoStars({ repoName, fallback = 0 }: { repoName: string; fallback?: number }) {
  const { stats, isLoading } = useGitHubStats();
  const repoStats = getRepoStats(stats, repoName);
  const value = repoStats?.stars ?? fallback;

  return <span className={isLoading ? 'opacity-50' : ''}>{value.toLocaleString()}</span>;
}

export function RepoForks({ repoName, fallback = 0 }: { repoName: string; fallback?: number }) {
  const { stats, isLoading } = useGitHubStats();
  const repoStats = getRepoStats(stats, repoName);
  const value = repoStats?.forks ?? fallback;

  return <span className={isLoading ? 'opacity-50' : ''}>{value.toLocaleString()}</span>;
}
