import { NextResponse } from 'next/server';
import { hasGithubProfile, siteConfig } from '@/lib/site-config';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USERNAME = siteConfig.githubUsername;

let cachedData: GitHubStats | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000;

interface RepoStats {
  name: string;
  stars: number;
  forks: number;
}

interface GitHubStats {
  totalStars: number;
  totalForks: number;
  contributions: number;
  repos: RepoStats[];
  updatedAt: string;
}

async function fetchGitHubData(): Promise<GitHubStats> {
  if (GITHUB_TOKEN) {
    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query($username: String!) {
              user(login: $username) {
                repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
                  nodes {
                    name
                    stargazerCount
                    forkCount
                  }
                }
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                  }
                }
              }
            }
          `,
          variables: { username: GITHUB_USERNAME },
        }),
      });

      if (response.ok) {
        const data = await response.json();

        if (!data.errors) {
          const user = data.data.user;
          const repos = user.repositories.nodes;

          let totalStars = 0;
          let totalForks = 0;
          const repoStats: RepoStats[] = [];

          for (const repo of repos) {
            totalStars += repo.stargazerCount;
            totalForks += repo.forkCount;
            repoStats.push({
              name: repo.name,
              stars: repo.stargazerCount,
              forks: repo.forkCount,
            });
          }

          return {
            totalStars,
            totalForks,
            contributions: user.contributionsCollection.contributionCalendar.totalContributions,
            repos: repoStats,
            updatedAt: new Date().toISOString(),
          };
        }
      }
    } catch (error) {
      console.error('GraphQL API failed, falling back to REST:', error);
    }
  }

  const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=stars`);

  if (!reposResponse.ok) {
    throw new Error(`GitHub REST API error: ${reposResponse.status}`);
  }

  const repos = await reposResponse.json();

  let totalStars = 0;
  let totalForks = 0;
  const repoStats: RepoStats[] = [];

  for (const repo of repos) {
    totalStars += repo.stargazers_count || 0;
    totalForks += repo.forks_count || 0;
    repoStats.push({
      name: repo.name,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
    });
  }

  let contributions = 0;
  try {
    const contribResponse = await fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`);
    if (contribResponse.ok) {
      const contribData = await contribResponse.json();
      contributions = (contribData.contributions || []).reduce(
        (sum: number, item: { count: number }) => sum + item.count,
        0
      );
    }
  } catch {
    // Ignore contribution fetch failures.
  }

  return {
    totalStars,
    totalForks,
    contributions,
    repos: repoStats,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  if (!hasGithubProfile) {
    return NextResponse.json({
      totalStars: 0,
      totalForks: 0,
      contributions: 0,
      repos: [],
      updatedAt: new Date().toISOString(),
      cached: false,
      disabled: true,
    });
  }

  try {
    const now = Date.now();

    if (cachedData && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
      });
    }

    const stats = await fetchGitHubData();
    cachedData = stats;
    cacheTime = now;

    return NextResponse.json({
      ...stats,
      cached: false,
    });
  } catch (error) {
    console.error('GitHub API error:', error);

    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 });
  }
}
