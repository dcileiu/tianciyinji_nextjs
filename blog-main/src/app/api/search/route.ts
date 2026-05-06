import { NextResponse } from 'next/server';
import { getLocalPostDocuments } from '@/utils/content';

interface SearchIndexItem {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  content: string;
  date: string;
  coverImage: string | null;
  searchTitle: string;
  searchExcerpt: string;
  searchCategory: string;
  searchTags: string[];
  searchContent: string;
}

let searchIndexCache: {
  data: SearchIndexItem[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 1000;

async function buildSearchIndex() {
  if (searchIndexCache && Date.now() - searchIndexCache.timestamp < CACHE_DURATION) {
    return searchIndexCache.data;
  }

  const posts = await getLocalPostDocuments();
  const indexData = posts
    .filter((post) => !post.encrypted && !post.resource)
    .map((post) => ({
      slug: post.slug,
      title: post.title || '',
      excerpt: post.excerpt || '',
      category: post.category || '',
      tags: post.tags || [],
      content: post.plainText || '',
      date: post.date,
      coverImage: post.coverImage || null,
      searchTitle: (post.title || '').toLowerCase(),
      searchExcerpt: (post.excerpt || '').toLowerCase(),
      searchCategory: (post.category || '').toLowerCase(),
      searchTags: (post.tags || []).map((tag) => tag.toLowerCase()),
      searchContent: (post.plainText || '').toLowerCase(),
    }));

  searchIndexCache = {
    data: indexData,
    timestamp: Date.now(),
  };

  return indexData;
}

function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[str2.length][str1.length];
}

function buildMatchedExcerpt(content: string, displaySource: string, queryWords: string[]) {
  const firstMatchWord = queryWords.find((word) => word.length > 1 && content.includes(word));
  if (!firstMatchWord) {
    return displaySource;
  }

  const fallbackSource = displaySource || content;
  const loweredFallbackSource = fallbackSource.toLowerCase();
  const indexInFallback = loweredFallbackSource.indexOf(firstMatchWord);
  const index = indexInFallback >= 0 ? indexInFallback : content.indexOf(firstMatchWord);
  const start = Math.max(0, index - 50);
  const end = Math.min(fallbackSource.length, index + firstMatchWord.length + 100);

  return `${start > 0 ? '...' : ''}${fallbackSource.slice(start, end)}${end < fallbackSource.length ? '...' : ''}`;
}

function searchPosts(index: SearchIndexItem[], query: string) {
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/).filter((word) => word.length > 0);

  return index
    .map((post) => {
      let score = 0;
      let matchedExcerpt = post.excerpt;

      if (post.searchTitle === queryLower) {
        score += 100;
      } else if (post.searchTitle.includes(queryLower)) {
        score += 60;
      } else {
        const titleWords = post.searchTitle.split(/[\s\-_]+/);
        titleWords.forEach((titleWord) => {
          if (titleWord.includes(queryLower)) {
            score += 45;
          } else if (queryLower.includes(titleWord) && titleWord.length > 2) {
            score += 35;
          }

          queryWords.forEach((word) => {
            if (titleWord.includes(word) && word.length > 1) {
              score += 25;
            }

            const sim = similarity(titleWord, word);
            if (sim > 0.7) {
              score += sim * 20;
            }
          });
        });

        const titleSimilarity = similarity(post.searchTitle, queryLower);
        if (titleSimilarity > 0.5) {
          score += titleSimilarity * 15;
        }
      }

      if (post.searchCategory === queryLower) {
        score += 50;
      } else if (post.searchCategory.includes(queryLower)) {
        score += 35;
      } else {
        queryWords.forEach((word) => {
          if (post.searchCategory.includes(word) && word.length > 1) {
            score += 20;
          }

          const sim = similarity(post.searchCategory, word);
          if (sim > 0.7) {
            score += sim * 15;
          }
        });
      }

      const matchingTags = post.searchTags.filter((tag) => queryWords.some((word) => tag.includes(word)));
      score += matchingTags.length * 15;

      if (post.searchExcerpt.includes(queryLower)) {
        score += 25;
        matchedExcerpt = buildMatchedExcerpt(post.searchExcerpt, post.excerpt, queryWords);
      } else {
        const excerptMatches = queryWords.filter((word) => word.length > 1 && post.searchExcerpt.includes(word));
        score += excerptMatches.length * 12;
        if (excerptMatches.length > 0) {
          matchedExcerpt = buildMatchedExcerpt(post.searchExcerpt, post.excerpt, queryWords);
        }
      }

      if (post.searchContent.includes(queryLower)) {
        score += 10;
        matchedExcerpt = buildMatchedExcerpt(post.searchContent, post.excerpt || post.content, queryWords);
      } else {
        score += queryWords.filter((word) => word.length > 1 && post.searchContent.includes(word)).length * 3;
      }

      return {
        slug: post.slug,
        title: post.title,
        excerpt: matchedExcerpt,
        category: post.category,
        tags: post.tags,
        coverImage: post.coverImage,
        date: post.date,
        score,
      };
    })
    .filter((post) => post.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 30);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 1) {
      return NextResponse.json({ results: [] });
    }

    const searchIndex = await buildSearchIndex();
    const results = searchPosts(searchIndex, query);

    return NextResponse.json({
      results,
      count: results.length,
      cached: searchIndexCache !== null,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
