import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { normalizeLocale } from '@/lib/i18n';
import { isToolInSegment, toolsBySegment } from '@/lib/tools/catalog';
import { buildToolJsonLd, buildToolMetadata } from '@/lib/tools/tool-page-meta';

const SEGMENT = 'calc' as const;
const SECTION = 'calc-tools' as const;

export function generateStaticParams() {
  return toolsBySegment(SEGMENT).map((tool) => ({ tool }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; tool: string }> }): Promise<Metadata> {
  const { locale, tool } = await params;
  if (!isToolInSegment(SEGMENT, tool)) return {};
  return buildToolMetadata(SEGMENT, tool, normalizeLocale(locale));
}

export default async function ToolDetailPage({ params }: { params: Promise<{ locale: string; tool: string }> }) {
  const { locale: rawLocale, tool } = await params;
  if (!isToolInSegment(SEGMENT, tool)) notFound();
  const locale = normalizeLocale(rawLocale);
  return (
    <>
      <JsonLd data={buildToolJsonLd(SEGMENT, tool, locale)} />
      <ToolsClientPage section={SECTION} tool={tool} />
    </>
  );
}
