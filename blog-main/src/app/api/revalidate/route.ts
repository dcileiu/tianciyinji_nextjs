import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { postExists } from '@/utils/posts';

const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('x-revalidate-token');
    if (token !== REVALIDATE_TOKEN) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { type = 'all', slugs = [] } = await req.json();

    if (type === 'all') {
      revalidatePath('/');
      revalidatePath('/archive');
      revalidatePath('/resources');
      revalidatePath('/rss');

      return NextResponse.json({
        revalidated: true,
        type: 'all',
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'posts' && Array.isArray(slugs) && slugs.length > 0) {
      const results = await Promise.all(
        slugs.map(async (slug: string) => {
          const exists = await postExists(slug);
          if (exists) {
            revalidatePath(`/post/${slug}`);
          }

          return { slug, success: exists };
        })
      );

      return NextResponse.json({
        revalidated: true,
        type: 'posts',
        results,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ message: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('[Revalidate API] Revalidation error:', error);
    return NextResponse.json(
      {
        message: 'Error revalidating',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
