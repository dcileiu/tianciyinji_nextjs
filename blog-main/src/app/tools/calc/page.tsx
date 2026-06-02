import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { pageTitle } from '@/lib/site-config';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';

const title = pageTitle('计算换算工具：房贷、个税、BMI、日期间隔、单位换算');

const description =
  '在线计算与换算工具：房贷计算器（等额本息/等额本金）、个税计算器、BMI 身体质量指数、日期间隔与年龄计算、长度/重量/面积/存储/温度单位换算，输入即算，全部本地完成。';

export const metadata: Metadata = buildPageMetadata({
  title,
  description,
  path: '/tools/calc',
  keywords: ['房贷计算器', '个税计算器', 'BMI 计算器', '日期间隔', '年龄计算', '单位换算', '温度换算'],
});

export default async function CalcToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool } = await searchParams;
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title, description, path: '/tools/calc' })} />
      <ToolsClientPage section="calc-tools" initialTool={tool} />
    </>
  );
}
