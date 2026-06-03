import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import ToolsClientPage from '@/components/ToolsClientPage';
import { getLocale } from '@/lib/i18n-server';
import { buildCollectionPageJsonLd, buildPageMetadata } from '@/lib/seo';
import { pageTitle } from '@/lib/site-config';

const copy = {
  'zh-CN': {
    title: '计算换算工具：房贷、个税、BMI、日期间隔、单位换算',
    description:
      '在线计算与换算工具：房贷计算器（等额本息 / 等额本金）、个税计算器、BMI 身体质量指数、日期间隔与年龄计算、长度 / 重量 / 面积 / 存储 / 温度单位换算，输入即算，全部本地完成。',
    keywords: ['房贷计算器', '个税计算器', 'BMI 计算器', '日期间隔', '年龄计算', '单位换算', '温度换算'],
  },
  en: {
    title: 'Calculator Tools: Mortgage, Income Tax, BMI, Date Difference, Unit Conversion',
    description:
      'Online calculators and converters for mortgage payments, income tax, BMI, date difference, age calculation, and common units such as length, weight, area, storage, and temperature. Calculations run locally.',
    keywords: ['mortgage calculator', 'income tax calculator', 'BMI calculator', 'date difference', 'age calculator', 'unit converter', 'temperature converter'],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const text = copy[locale];
  return buildPageMetadata({ title: pageTitle(text.title), description: text.description, path: '/tools/calc', keywords: [...text.keywords], locale });
}

export default async function CalcToolsPage({ searchParams }: { searchParams: Promise<{ tool?: string }> }) {
  const { tool } = await searchParams;
  const locale = await getLocale();
  const text = copy[locale];
  return (
    <>
      <JsonLd data={buildCollectionPageJsonLd({ title: pageTitle(text.title), description: text.description, path: '/tools/calc' })} />
      <ToolsClientPage section="calc-tools" initialTool={tool} />
    </>
  );
}
