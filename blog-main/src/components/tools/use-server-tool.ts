'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { getPathLocale } from '@/lib/i18n';

export function useServerTool<T = any>(tool: string) {
  const pathname = usePathname();
  const locale = getPathLocale(pathname);
  const text =
    locale === 'en'
      ? {
          requestFailed: 'Request failed.',
          copyFailed: 'Copy failed. Please select the text and copy it manually.',
        }
      : {
          requestFailed: '请求失败。',
          copyFailed: '复制失败，请手动选中文本复制。',
        };
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function run(payload?: Record<string, unknown>) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-locale': locale },
        body: JSON.stringify({ tool, payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || text.requestFailed);
      }
      setResult(data.data);
      return data.data as T;
    } catch (e) {
      setError(e instanceof Error ? e.message : text.requestFailed);
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function copy(textToCopy: string) {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(text.copyFailed);
    }
  }

  return { loading, result, error, copied, run, copy };
}
