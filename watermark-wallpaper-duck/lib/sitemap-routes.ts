import fs from 'node:fs';
import path from 'node:path';

const PAGE_FILES = new Set(['page.tsx', 'page.ts', 'page.jsx', 'page.js']);

/** 扫描 app 目录，收集所有静态页面路由（构建时执行） */
export function discoverAppRoutes(appDir = path.join(process.cwd(), 'app')): string[] {
  if (!fs.existsSync(appDir)) return ['/'];

  const routes = collectRoutes(appDir, []);
  const unique = [...new Set(routes)];
  unique.sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    return a.localeCompare(b);
  });
  return unique;
}

function collectRoutes(dir: string, segments: string[]): string[] {
  const routes: string[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return routes;
  }

  for (const entry of entries) {
    const name = entry.name;
    if (name.startsWith('_') || name.startsWith('.')) continue;

    const fullPath = path.join(dir, name);

    if (entry.isDirectory()) {
      if (name === 'api') continue;

      const segment = parseRouteSegment(name);
      if (segment === null) continue;

      const nextSegments = segment === '' ? segments : [...segments, segment];
      routes.push(...collectRoutes(fullPath, nextSegments));
      continue;
    }

    if (PAGE_FILES.has(name)) {
      routes.push(segments.length === 0 ? '/' : `/${segments.join('/')}`);
    }
  }

  return routes;
}

/** 路由组 (marketing) 不计入 URL；动态段 [slug] 跳过（需另行 generateStaticParams） */
function parseRouteSegment(name: string): string | null {
  if (name.startsWith('(') && name.endsWith(')')) return '';
  if (name.startsWith('[')) return null;
  return name;
}

export function routePriority(route: string): number {
  return route === '/' ? 1 : 0.8;
}

export function routeChangeFrequency(route: string): 'daily' | 'weekly' | 'monthly' {
  return route === '/' ? 'daily' : 'weekly';
}
